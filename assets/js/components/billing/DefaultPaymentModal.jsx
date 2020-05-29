import React, { Component } from 'react'
import analyticsLogger from '../../util/analyticsLogger'
import { Modal, Button } from 'antd';
import ExistingCardsAddCard from './ExistingCardsAddCard'

class DefaultPaymentModal extends Component {
  state = {
    newCard: null
  }

  handleNewCardUpdate = newCard => {
    this.setState({
      newCard
    })
  }

  handleSubmit = (e) => {
    e.preventDefault();

    // analyticsLogger.logEvent("ACTION_CREATE_NEW_PAYMENT_METHOD", { "organization": organization.id, "email": email, "role": role })

    this.props.onClose()
  }

  render() {
    const { open, onClose } = this.props

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
        <ExistingCardsAddCard
          handleNewCardUpdate={this.handleNewCardUpdate}
        />
      </Modal>
    )
  }
}

export default DefaultPaymentModal
