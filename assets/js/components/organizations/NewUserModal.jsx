import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { inviteUser } from '../../actions/organization'
import RoleControl from './RoleControl'
import analyticsLogger from '../../util/analyticsLogger'
import { Modal, Button, Typography, Input, Card } from 'antd';
const { Text } = Typography

@connect(mapStateToProps, mapDispatchToProps)
class NewUserModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      role: "manager"
    }

    this.handleInputUpdate = this.handleInputUpdate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleSubmit(e) {
    e.preventDefault();
    const { email, role } = this.state;
    const { organization } = this.props

    analyticsLogger.logEvent("ACTION_CREATE_NEW_MEMBERSHIP", { "organization": organization.id, "email": email, "role": role })
    this.props.inviteUser({ email, role, organization: organization.id });

    this.props.onClose()
  }

  render() {
    const { open, onClose, organization } = this.props

    return (
      <Modal
        title={`Invite new user to: ${organization.name}`}
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
      <Card size="small" title="Enter Email" >
        <Text>
          Enter the email address of the user you'd like to invite, and choose the role they should have.
        </Text>
        <Input
          placeholder="Email"
          name="email"
          value={this.state.email}
          onChange={this.handleInputUpdate}
          style={{ marginTop: 20 }}
        />
        </Card>
              <Card size="small" title="Choose Role">

        <RoleControl
          value={this.state.role}
          onChange={this.handleInputUpdate}
        />
        </Card>
      </Modal>
    )
  }
}

function mapStateToProps(state) {
  return {
    organization: {
      id: state.auth.currentOrganizationId,
      name: state.auth.currentOrganizationName,
    }
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ inviteUser }, dispatch)
}

export default NewUserModal
