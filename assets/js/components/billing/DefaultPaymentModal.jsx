import React, { Component } from 'react'
import stripe from '../../config/stripe'
import { connect } from 'react-redux'
import { displayError } from '../../util/messages'
import { bindActionCreators } from 'redux'
import { setDefaultPaymentMethod, getSetupPaymentMethod, removePaymentMethod, checkPaymentMethod } from '../../actions/dataCredits'
import ExistingPaymentCards from './ExistingPaymentCards'
import StripeCardElement from './StripeCardElement'
import { Modal, Button, Typography } from 'antd';
const { Text } = Typography

@connect(null, mapDispatchToProps)
class DefaultPaymentModal extends Component {
  state = {
    paymentMethodSelected: undefined,
    loading: false,
  }

  componentDidMount() {
    if (!process.env.SELF_HOSTED || window.stripe_public_key) {
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
  }

  componentDidUpdate(prevProps) {
    if(!prevProps.open && this.props.open) {
      setTimeout(() => {
        this.card.mount("#card-element-default-modal")
        this.setState({ paymentMethodSelected: this.props.organization.default_payment_id })
      }, 100)
    }

    if(prevProps.open && !this.props.open) {
      this.card.unmount()
      setTimeout(() => {
        this.setState({ paymentMethodSelected: this.props.organization.default_payment_id })
      }, 100)
    }

    if (prevProps.organization && prevProps.organization.default_payment_id !== this.props.organization.default_payment_id) {
      this.setState({ paymentMethodSelected: this.props.organization.default_payment_id })
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();

    this.setState({ loading: true })
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
          return this.props.checkPaymentMethod(result.setupIntent.payment_method)
          .then(data => {
            if (data.duplicate_card) {
              displayError("This payment method could not be added successfully, please try another payment method.")
              this.removePaymentMethod(result.setupIntent.payment_method)
            } else {
              this.props.fetchPaymentMethods(() => {
                this.props.setDefaultPaymentMethod(result.setupIntent.payment_method)
              })
            }
            this.props.onClose()
          })
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
    let latestAddedCardId = null
    const otherCards = this.props.paymentMethods.filter(c => c.id !== paymentId).sort((a, b) => a.created > b.created)
    if (otherCards[0]) latestAddedCardId = otherCards[0].id

    this.props.removePaymentMethod(paymentId, latestAddedCardId)
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
        {
          paymentMethods.length > 0 && (
            <ExistingPaymentCards
              paymentMethods={paymentMethods}
              paymentMethodSelected={this.state.paymentMethodSelected}
              onRadioChange={this.onRadioChange}
              showDelete
              removePaymentMethod={this.removePaymentMethod}
            />
          )
        }

        <div>
          <Text strong>
            {paymentMethods.length > 0 && "...or "}Add Card
          </Text>
          {
            open && <StripeCardElement id="card-element-default-modal"/>
          }
        </div>
      </Modal>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ setDefaultPaymentMethod, getSetupPaymentMethod, removePaymentMethod, checkPaymentMethod }, dispatch)
}

export default DefaultPaymentModal
