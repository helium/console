import React, { Component } from 'react'
import analyticsLogger from '../../util/analyticsLogger'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { setDefaultPaymentMethod } from '../../actions/dataCredits'
import ExistingPaymentCards from './ExistingPaymentCards'
import { Modal, Button, Divider, Typography } from 'antd';
const { Text } = Typography

@connect(null, mapDispatchToProps)
class DefaultPaymentModal extends Component {
  state = {
    paymentMethodSelected: undefined
  }

  handleSubmit = (e) => {
    e.preventDefault();

    // analyticsLogger.logEvent("ACTION_CREATE_NEW_PAYMENT_METHOD", { "organization": organization.id, "email": email, "role": role })
    this.props.setDefaultPaymentMethod(this.state.paymentMethodSelected)
    this.props.onClose()
  }

  onRadioChange = e => {
    this.setState({ paymentMethodSelected: e.target.value })
  }

  render() {
    const { open, onClose, paymentMethods } = this.props

    return (
      <Modal
        title="Default Payment Method"
        visible={open}
        onCancel={onClose}
        centered
        onOk={this.handleSubmit}
        footer={[
          <Button key="back" onClick={onClose}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={this.handleSubmit}>
            Make Default Payment Method
          </Button>,
        ]}
      >
        <ExistingPaymentCards
          paymentMethods={paymentMethods}
          paymentMethodSelected={this.state.paymentMethodSelected}
          onRadioChange={this.onRadioChange}
        />
      </Modal>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ setDefaultPaymentMethod }, dispatch)
}

export default DefaultPaymentModal
