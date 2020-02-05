import React, { Component } from 'react'
import analyticsLogger from '../../util/analyticsLogger'
import { Modal, Button, Typography, Input } from 'antd';
const { Text } = Typography

class DeleteUserModal extends Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();

    const { membership, deleteMembership, deleteInvitation, onClose } = this.props

    if (membership.type === 'membership') {
      analyticsLogger.logEvent("ACTION_DELETE_MEMBERSHIP", {"email": membership.email})
      deleteMembership(membership)
    }

    if (membership.type === 'invitation') {
      analyticsLogger.logEvent("ACTION_DELETE_INVITATION", { "email": membership.email })
      deleteInvitation(membership)
    }

    onClose()
  }

  render() {
    const { open, onClose, membership } = this.props

    if (membership === null) return <div />

    return (
      <Modal
        title="Delete user"
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
        <Text>Are you sure you want to remove {membership.email} from this organization?</Text>
      </Modal>
    )
  }
}

export default DeleteUserModal
