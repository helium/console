import React, { Component } from 'react'
import PaymentCard from './PaymentCard'
import analyticsLogger from '../../util/analyticsLogger'
import { Modal, Button, Divider, Typography } from 'antd';
const { Text } = Typography

class DefaultPaymentModal extends Component {
  handleSubmit = (e) => {
    e.preventDefault();

    // analyticsLogger.logEvent("ACTION_CREATE_NEW_PAYMENT_METHOD", { "organization": organization.id, "email": email, "role": role })

    this.props.onClose()
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
            Submit
          </Button>,
        ]}
      >
        <div style={{ marginBottom: 24 }}>
          <Text strong>
            Choose from Stored Cards
          </Text>
          <Divider style={{ margin: '8px 0px 16px 0px' }}/>
          {
            paymentMethods.length === 0 && (
              <Text>
                None available, create one below...
              </Text>
            )
          }
          {
            paymentMethods.map(p => (
              <PaymentCard key={p.id} card={p.card} />
            ))
          }
        </div>
      </Modal>
    )
  }
}

export default DefaultPaymentModal
