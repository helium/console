import React, { Component } from 'react'
import analyticsLogger from '../../util/analyticsLogger'
import { displayError } from '../../util/messages'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import ExistingCardsAddCard from './ExistingCardsAddCard'
import AmountEntryCalculator from './AmountEntryCalculator'
import { createCustomerIdAndCharge } from '../../actions/dataCredits'
import { Modal, Button, Typography, Divider, Select } from 'antd';
const { Text } = Typography
const { Option } = Select
const stripe = Stripe('pk_test_tpiYaEpZAZ8EGaqTZTujgQKG00e64rEo1V')

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
  }

  componentDidMount() {
    const elements = stripe.elements()

    const style = {
      base: {
        color: "#32325d",
      }
    }
    this.card = elements.create("card", { style: style })
  }

  handleCountInputUpdate = (e) => {
    if (e.target.value < 0) return

    if (e.target.name == 'countDC') {
      this.setState({
        countDC: e.target.value,
        countUSD: e.target.value / 100000,
        countB: e.target.value * 24
      })
    }
    if (e.target.name == 'countUSD') {
      this.setState({
        countDC: e.target.value * 100000,
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
    const { organization, createCustomerIdAndCharge } = this.props
    this.setState({ loading: true })
    // if (organization.stripe_customer_id === null) {
      createCustomerIdAndCharge(this.state.countUSD)
      .then(({ payment_intent_secret }) => {
        this.setState({
          showPayment: true,
          loading: false,
          paymentIntentSecret: payment_intent_secret
        }, () => this.card.mount("#card-element"))
      })
      .catch(err => {
        this.setState({ loading: false })
      })
    // }
  }

  handleBack = () => {
    this.setState({ showPayment: false },
      () => this.card.unmount("#card-element")
    )
  }

  handleSubmit = (e, card) => {
    e.preventDefault();
    this.setState({ loading: true })

    stripe.confirmCardPayment(this.state.paymentIntentSecret, {
      payment_method: {
        card: this.card,
        billing_details: {
          name: this.props.organization.name
        }
      },
      setup_future_usage: 'off_session'
    }).then(result => {
      if (result.error) {
        displayError(result.error.message)
        this.setState({ loading: false })
      } else {
        if (result.paymentIntent.status === 'succeeded') {
          // analyticsLogger.logEvent("ACTION_CREATE_NEW_PAYMENT_METHOD", { "organization": organization.id, "email": email, "role": role })
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
          this.state.countDC > 0 && (
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
                <Option value="monthly">Monthly (same amount)</Option>
              </Select>
            </div>
          )
        }
      </div>
    )
  }

  renderPayment = () => {
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
        <ExistingCardsAddCard />
        <div>
          <Text strong>
            ...or Add New Card
          </Text>
          <div style={{ marginTop: 24 }}>
            <div id="card-element" />
            <div id="card-errors" role="alert" />
          </div>
        </div>
      </React.Fragment>
    )
  }

  render() {
    const { open, onClose } = this.props
    const { loading } = this.state

    return (
      <Modal
        title="Purchase Data Credits"
        visible={open}
        onCancel={loading ? () => {} : onClose}
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
            <Button key="back" onClick={onClose} disabled={loading}>
              Cancel
            </Button>,
            <Button key="submit" type="primary" onClick={this.handleNext} disabled={!this.state.countDC || this.state.countDC == 0 || loading}>
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
  return bindActionCreators({ createCustomerIdAndCharge }, dispatch)
}

export default PurchaseCreditModal
