import React, { Component } from 'react'
import analyticsLogger from '../../util/analyticsLogger'
import { displayError } from '../../util/messages'
import stripe from '../../config/stripe'
import { connect } from 'react-redux'
import numeral from 'numeral'
import find from 'lodash/find'
import { bindActionCreators } from 'redux'
import ExistingPaymentCards from './ExistingPaymentCards'
import StripeCardElement from './StripeCardElement'
import AmountEntryCalculator from './AmountEntryCalculator'
import { setDefaultPaymentMethod, createCustomerIdAndCharge, createCharge, createDCPurchase, setAutomaticPayments } from '../../actions/dataCredits'
import { Modal, Button, Typography, Divider, Select, Radio, Checkbox } from 'antd';
const { Text } = Typography
const { Option } = Select

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
    showPayment: false,
    countDC: undefined,
    countUSD: undefined,
    countB: undefined,
    chargeOption: 'once',
    paymentIntentSecret: null,
    loading: false,
    checked: false,
    paymentMethodSelected: undefined
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

            if (this.state.chargeOption !== 'none') {
              this.props.setAutomaticPayments(
                this.state.countUSD,
                result.paymentIntent.payment_method,
                this.state.chargeOption,
              )
            }
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

  handleSelectCharge = chargeOption => {
    this.setState({ chargeOption })
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
              <div style={{ marginBottom: 8, marginTop: 12 }}>
                <Text strong>When to Charge</Text>
              </div>
              <Select
                defaultValue={this.state.chargeOption}
                onChange={this.handleSelectCharge}
                style={{ width: '100%'}}
                disabled={this.state.loading}
              >
                <Option value="once">One time purchase</Option>
                <Option value="10%">10% remaining</Option>
              </Select>
            </div>
          )
        }

        {
          this.state.chargeOption != 'once' && (
            <div style={styles.checkboxContainer}>
              <Checkbox
                onChange={e => this.setState({ checked: e.target.checked })}
                checked={this.state.checked}
                style={{ marginRight: 8 }}
              />
              <Text>
                I authorize the use of the payment method above to be
                automatically charged according to Helium's Terms & Conditions.
              </Text>
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

  render() {
    const { open } = this.props
    const { loading } = this.state

    return (
      <Modal
        title="Purchase Data Credits"
        visible={open}
        onCancel={loading ? () => {} : this.handleClose}
        centered
        footer={
          this.state.showPayment ?
          [
            <Button key="back" onClick={this.handleBack} disabled={loading}>
              Back
            </Button>,
            <Button key="submit" type="primary" onClick={this.handleSubmit} disabled={loading}>
              Make Payment
            </Button>,
          ] :
          [
            <Button key="back" onClick={this.handleClose} disabled={loading}>
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={this.handleNext}
              disabled={
                !this.state.countUSD || this.state.countUSD == 0 || loading || (this.state.chargeOption !== 'once' && !this.state.checked)
              }
            >
              Continue To Payment
            </Button>,
          ]
        }
      >
        {!this.state.showPayment && this.renderCountSelection()}
        {this.state.showPayment && this.renderPayment()}
      </Modal>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createCustomerIdAndCharge, createCharge, setDefaultPaymentMethod, createDCPurchase, setAutomaticPayments }, dispatch)
}

export default PurchaseCreditModal
