import React, { Component } from 'react'
import analyticsLogger from '../../util/analyticsLogger'
import { connect } from 'react-redux'
import { displayError } from '../../util/messages'
import { bindActionCreators } from 'redux'
import { setDefaultPaymentMethod, getSetupPaymentMethod, removePaymentMethod } from '../../actions/dataCredits'
import ExistingPaymentCards from './ExistingPaymentCards'
import StripeCardElement from './StripeCardElement'
import { Modal, Button, Divider, Typography } from 'antd';
const { Text } = Typography
const stripe = Stripe('pk_test_tpiYaEpZAZ8EGaqTZTujgQKG00e64rEo1V')

@connect(null, mapDispatchToProps)
class DefaultPaymentModal extends Component {
  state = {
    paymentMethodSelected: undefined,
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

    this.card.on('focus', () => {
      this.setState({ paymentMethodSelected: undefined })
    })
  }

  componentDidUpdate(prevProps) {
    if(!prevProps.open && this.props.open) setTimeout(() => this.card.mount("#card-element"), 100)
  }

  handleSubmit = (e) => {
    e.preventDefault();

    this.setState({ loading: true })
    // analyticsLogger.logEvent("ACTION_CREATE_NEW_PAYMENT_METHOD", { "organization": organization.id, "email": email, "role": role })
    if (!this.state.paymentMethodSelected) {
      this.props.getSetupPaymentMethod()
      .then(({ setup_intent_secret }) => {
        const payment = {
          payment_method: {
            card: this.card,
            billing_details: {
              name: this.props.organization.name
            }
          }
        }

        return stripe.confirmCardSetup(setup_intent_secret, payment)
      })
      .then(result => {
        this.setState({ loading: false })
        if (result.error) {
          displayError(result.error.message)
        } else {
          this.props.fetchPaymentMethods(() => {
            this.props.setDefaultPaymentMethod(result.setupIntent.payment_method)
          })
          this.props.onClose()
        }
      })
      .catch(() => {
        displayError("Could not process your request, please try again.")
        this.setState({ loading: false })
      })
    } else {
      this.setState({ loading: false })
      this.props.setDefaultPaymentMethod(this.state.paymentMethodSelected)
      this.props.onClose()
    }
  }

  onRadioChange = e => {
    this.card.clear()
    this.setState({ paymentMethodSelected: e.target.value })
  }

  removePaymentMethod = (paymentId) => {
    this.props.removePaymentMethod(paymentId)
    .then(() => {
      this.props.fetchPaymentMethods()
    })
  }

  render() {
    const { open, onClose, paymentMethods } = this.props
    const { loading } = this.state

    return (
      <Modal
        title="Default Payment Method"
        visible={open}
        onCancel={loading ? () => {} : onClose}
        centered
        onOk={this.handleSubmit}
        footer={[
          <Button key="back" onClick={onClose} disabled={loading}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={this.handleSubmit} disabled={loading}>
            Make Default Payment Method
          </Button>,
        ]}
      >
        <ExistingPaymentCards
          paymentMethods={paymentMethods}
          paymentMethodSelected={this.state.paymentMethodSelected}
          onRadioChange={this.onRadioChange}
          showDelete
          removePaymentMethod={this.removePaymentMethod}
        />

        <div>
          <Text strong>
            ...or Add New Card
          </Text>
          {
            open && <StripeCardElement />
          }
        </div>
      </Modal>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ setDefaultPaymentMethod, getSetupPaymentMethod, removePaymentMethod }, dispatch)
}

export default DefaultPaymentModal
