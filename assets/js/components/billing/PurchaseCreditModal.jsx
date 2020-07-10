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
import StripeCardElement from './StripeCardElement'
import AmountEntryCalculator from './AmountEntryCalculator'
import { setDefaultPaymentMethod, createCustomerIdAndCharge, createCharge, createDCPurchase, setAutomaticPayments } from '../../actions/dataCredits'
import { Modal, Button, Typography, Divider, Radio, Checkbox, Tabs, Icon } from 'antd';
const { Text } = Typography
const { TabPane } = Tabs

const styles = {
  container: {
    backgroundColor: '#E6F7FF',
    padding: 24,
    borderRadius: 8,
  },
  costNumber: {
    color: '#4091F7',
    fontSize: 30,
    marginTop: -8
  },
  checkboxContainer: {
    marginTop: 30,
    display: 'flex',
    flexDirection: 'row'
  }
}

@connect(null, mapDispatchToProps)
class PurchaseCreditModal extends Component {
  state = {
    tabActiveKey: 1,
    showPayment: false,
    countDC: undefined,
    countUSD: undefined,
    countB: undefined,
    paymentIntentSecret: null,
    loading: false,
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

  componentDidUpdate(prevProps) {
    if (!prevProps.open && this.props.open) {
      this.setState({ qrContent: "yess" })
    }
    if (prevProps.open && !this.props.open) {
      this.setState({ qrContent: null })
    }
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

  handleNext = () => {
    const { organization, createCustomerIdAndCharge, createCharge } = this.props
    const defaultPayment = find(this.props.paymentMethods, p => p.id === organization.default_payment_id)
    const paymentMethodSelected = defaultPayment ? defaultPayment.id : undefined

    this.setState({ loading: true })

    if (organization.stripe_customer_id === null) {
      createCustomerIdAndCharge(this.state.countUSD)
      .then(({ payment_intent_secret }) => {
        this.setState({
          showPayment: true,
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
          showPayment: true,
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
    this.setState({ showPayment: false })
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

          this.setState({ loading: false, showPayment: false })
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
    return(
      <div>
        <AmountEntryCalculator
          countDC={this.state.countDC}
          countB={this.state.countB}
          countUSD={this.state.countUSD}
          handleCountInputUpdate={this.handleCountInputUpdate}
          disabled={this.state.loading}
        />
        {
          this.state.countUSD > 0 && (
            <div>
              <Divider style={{ marginTop: 32, marginBottom: 12 }}/>
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Text strong>Cost</Text>
                <Text style={styles.costNumber}>${this.state.countUSD || "0.00"}</Text>
              </div>
            </div>
          )
        }
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
    if (this.state.tabActiveKey == 1) return (
      [
        <Button key="back" onClick={this.handleClose}>
          Cancel
        </Button>,
        <Button type="primary" onClick={this.handleClose}>
          I've made my payment
        </Button>,
      ]
    )
    if (this.state.showPayment) return (
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
          onClick={this.handleNext}
          disabled={!this.state.countUSD || this.state.countUSD == 0 || this.state.loading}
        >
          Continue To Payment
        </Button>,
      ]
    )
  }

  render() {
    const { open } = this.props
    const { loading } = this.state

    return (
      <Modal
        title="Purchase Data Credits"
        visible={open}
        onCancel={loading ? () => {} : this.handleClose}
        centered
        footer={this.renderModalFooter()}
      >
        <Tabs
          defaultActiveKey="1"
          animated={false}
          onChange={tabActiveKey => this.setState({ tabActiveKey })}
          tabBarStyle={{
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <TabPane tab={<Text style={{ color: this.state.tabActiveKey == 1 && "#4091F7" }}><Icon type="fire" theme="filled" />Burn HNT</Text>} key="1">
            <div style={{ padding: 20, display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
              {this.state.qrContent && <QRCode value={this.state.qrContent} size={180}/>}
            </div>
          </TabPane>
          <TabPane tab={<Text style={{ color: this.state.tabActiveKey == 2 && "#4091F7" }}><Icon type="credit-card" />Charge Credit Card</Text>} key="2">
            {!this.state.showPayment && this.renderCountSelection()}
            {this.state.showPayment && this.renderPayment()}
          </TabPane>
        </Tabs>
      </Modal>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createCustomerIdAndCharge, createCharge, setDefaultPaymentMethod, createDCPurchase, setAutomaticPayments }, dispatch)
}

export default PurchaseCreditModal
