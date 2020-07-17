import React, { Component } from 'react'
import analyticsLogger from '../../util/analyticsLogger'
import { displayError } from '../../util/messages'
import stripe from '../../config/stripe'
import { connect } from 'react-redux'
import QRCode from 'react-qr-code'
import numeral from 'numeral'
import find from 'lodash/find'
import { bindActionCreators } from 'redux'
import ExistingPaymentCards from './ExistingPaymentCards'
import { convertToTextShort } from './AmountEntryCalculator'
import StripeCardElement from './StripeCardElement'
import { setDefaultPaymentMethod, createCustomerIdAndCharge, createCharge, createDCPurchase, setAutomaticPayments, generateMemo } from '../../actions/dataCredits'
import { Modal, Button, Typography, Radio, Checkbox, Input } from 'antd';
const { Text } = Typography

const styles = {
  container: {
    backgroundColor: '#E6F7FF',
    padding: 24,
    borderRadius: 8,
  },
  costNumber: {
    color: '#4091F7',
    fontSize: 24,
    marginTop: -8
  },
  countBlueBox: {
    backgroundColor: '#E6F7FF',
    paddingLeft: 100,
    paddingRight: 100,
    paddingTop: 30,
    paddingBottom: 30,
    height: '100%',
    width: '100%',
    marginTop: 30
  },
  costContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#BAE7FF',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 15,
    paddingBottom: 10,
    marginTop: 15,
    borderRadius: 8
  }
}

@connect(null, mapDispatchToProps)
class PurchaseCreditModal extends Component {
  state = {
    showPage: "default",
    countDC: undefined,
    countUSD: undefined,
    countB: undefined,
    loading: false,
    paymentIntentSecret: null,
    paymentMethodSelected: undefined,
    qrContent: null,
  }

  componentDidMount() {
    const elements = stripe.elements()

    const style = {
      base: {
        color: "#32325d",
      }
    }
    this.card = elements.create("card", { style: style })

    this.card.on('focus', () => {
      this.setState({ paymentMethodSelected: undefined })
    })
  }

  handleCountInputUpdate = (e) => {
    if (e.target.value < 0) return
    if (e.target.value.length > 7) return
    if (e.target.value.split('.')[1] && e.target.value.split('.')[1].length > 2) return
    // Refactor out conversion rates between USD, DC, Bytes later
    if (e.target.name == 'countUSD') {
      this.setState({
        countDC: numeral(e.target.value * 100000).format('0,0'),
        countUSD: e.target.value,
        countB: e.target.value * 100000 * 24
      })
    }
    if (e.target.value == '') {
      this.setState({
        countDC: undefined,
        countUSD: undefined,
        countB: undefined,
      })
    }
  }

  showCreditCard = () => {
    const { organization, createCustomerIdAndCharge, createCharge } = this.props
    const defaultPayment = find(this.props.paymentMethods, p => p.id === organization.default_payment_id)
    const paymentMethodSelected = defaultPayment ? defaultPayment.id : undefined

    this.setState({ loading: true })

    if (organization.stripe_customer_id === null) {
      createCustomerIdAndCharge(this.state.countUSD)
      .then(({ payment_intent_secret }) => {
        this.setState({
          showPage: "creditcard",
          loading: false,
          paymentIntentSecret: payment_intent_secret,
          paymentMethodSelected
        }, () => this.card.mount("#card-element"))
      })
      .catch(err => {
        this.setState({ loading: false })
      })
    } else {
      createCharge(this.state.countUSD)
      .then(({ payment_intent_secret }) => {
        this.setState({
          showPage: "creditcard",
          loading: false,
          paymentIntentSecret: payment_intent_secret,
          paymentMethodSelected
        }, () => this.card.mount("#card-element"))
      })
      .catch(err => {
        this.setState({ loading: false })
      })
    }
  }

  handleBack = () => {
    this.setState({ showPage: "default" })
  }

  handleSubmit = (e, card) => {
    e.preventDefault();
    this.setState({ loading: true })
    let payment

    if (this.state.paymentMethodSelected) {
      payment = {
        payment_method: this.state.paymentMethodSelected
      }
    } else {
      payment = {
        payment_method: {
          card: this.card,
          billing_details: {
            name: this.props.organization.name
          }
        },
        setup_future_usage: 'off_session'
      }
    }

    stripe.confirmCardPayment(this.state.paymentIntentSecret, payment)
    .then(result => {
      if (result.error) {
        displayError(result.error.message)
        this.setState({ loading: false })
      } else {
        if (result.paymentIntent.status === 'succeeded') {
          this.props.fetchPaymentMethods(() => {
            const paymentMethod = find(this.props.paymentMethods, ["id", result.paymentIntent.payment_method])
            this.props.createDCPurchase(
              result.paymentIntent.amount,
              paymentMethod.card.brand,
              paymentMethod.card.last4,
              result.paymentIntent.id
            )
          })

          if (this.props.paymentMethods.length == 0) this.props.setDefaultPaymentMethod(result.paymentIntent.payment_method)

          this.setState({ loading: false, showPage: "default" })
          this.props.onClose()
        } else {
          this.setState({ loading: false })
          displayError("Could not process your payment, please try again.")
        }
      }
    })
  }

  onRadioChange = e => {
    this.card.clear()
    this.setState({ paymentMethodSelected: e.target.value })
  }

  handleClose = () => {
    setTimeout(() => this.handleBack(), 200)
    this.props.onClose()
  }

  renderCountSelection = () => {
    const { countUSD, countB } = this.state
    return(
      <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Text>1 DC = 24 Byte Packet = $0.00001 USD</Text>
        <div style={styles.countBlueBox}>
          <Input
            placeholder="Enter Quantity"
            name="countUSD"
            value={this.state.countUSD}
            onChange={this.handleCountInputUpdate}
            type="number"
          />
          {
            this.state.countUSD > 0 && (
              <div style={styles.costContainer}>
                <Text style={{ color: '#4091F7', marginTop: -5 }}>Cost:</Text>
                <Text style={styles.costNumber}>USD {countUSD && parseFloat(countUSD).toFixed(2)}</Text>
              </div>
            )
          }
        </div>
      </div>
    )
  }

  renderPayment = () => {
    const { paymentMethods } = this.props
    return (
      <React.Fragment>
        <div style={{
          ...styles.container,
          padding: 16,
          marginBottom: 24,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div><Text strong>{this.state.countDC}</Text></div>
            <div><Text>Data Credits</Text></div>
          </div>
          <Text style={styles.costNumber}>${this.state.countUSD || "0.00"}</Text>
        </div>

        {
          paymentMethods.length > 0 && (
            <ExistingPaymentCards
              paymentMethods={paymentMethods}
              paymentMethodSelected={this.state.paymentMethodSelected}
              onRadioChange={this.onRadioChange}
            />
          )
        }

        <div>
          <Text strong>
            {paymentMethods.length > 0 && "...or "}Add New Card
          </Text>
          {
            open && <StripeCardElement />
          }
        </div>
      </React.Fragment>
    )
  }

  renderModalFooter = () => {
    if (this.state.showPage == "creditcard") return (
      [
        <Button key="back" onClick={this.handleBack} disabled={this.state.loading}>
          Back
        </Button>,
        <Button key="submit" type="primary" onClick={this.handleSubmit} disabled={this.state.loading}>
          Make Payment
        </Button>,
      ]
    )
    return (
      [
        <Button key="back" onClick={this.handleClose} disabled={this.state.loading}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={this.showCreditCard}
          disabled={!this.state.countUSD || this.state.countUSD == 0 || this.state.loading}
        >
          Purchase with Credit Card
        </Button>,
      ]
    )
  }

  render() {
    const { open } = this.props
    const { loading } = this.state
    let title = "How many Data Credits do you wish to purchase?"
    if (this.state.showPage == "creditcard") title = "Purchase DC with Credit Card"

    return (
      <Modal
        title={title}
        visible={open}
        onCancel={loading ? () => {} : this.handleClose}
        centered
        footer={this.renderModalFooter()}
        bodyStyle={{ padding: this.state.showPage == "default" && 0 }}
      >
        {this.state.showPage == "default" && this.renderCountSelection()}
        {this.state.showPage == "creditcard" && this.renderPayment()}
      </Modal>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createCustomerIdAndCharge, createCharge, setDefaultPaymentMethod, createDCPurchase, setAutomaticPayments, generateMemo }, dispatch)
}

export default PurchaseCreditModal
