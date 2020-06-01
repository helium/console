import React, { Component } from 'react'
import RoleControl from './RoleControl'
import analyticsLogger from '../../util/analyticsLogger'
import { Modal, Button, Typography, Input } from 'antd';
const { Text } = Typography

class EditMembershipModal extends Component {
  state = {
    role: "read"
  }

  componentDidUpdate(prevProps) {
    const { membership } = this.props

    if (membership !== prevProps.membership) {
      this.setState({ role: membership.role })
    }
  }

  handleInputUpdate = (e) => {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleSubmit = (e) => {
    e.preventDefault();

    const { membership, updateMembership, onClose } = this.props
    const { role } = this.state;
    analyticsLogger.logEvent("ACTION_UPDATE_MEMBERSHIP", {"email": membership.email, "role": role })
    updateMembership( membership.id, role );

    onClose()
  }

  render() {
    const { open, onClose, membership } = this.props

    if (membership === null) return <div />

    return (
      <Modal
        title="Edit user role"
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
        <Text>
          Select a new role for {membership.email}
        </Text>
        <RoleControl
          value={this.state.role}
          onChange={this.handleInputUpdate}
        />
      </Modal>
    )
  }
}

export default EditMembershipModal
