import React, { Component } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createOrganization } from '../../actions/team'
import analyticsLogger from '../../util/analyticsLogger'
import { Modal, Button, Typography, Input } from 'antd';
const { Text } = Typography

@connect(null, mapDispatchToProps)
class NewOrganizationModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: "",
      teamName: "",
    }

    this.handleInputUpdate = this.handleInputUpdate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleSubmit(e) {
    e.preventDefault();
    const { name, teamName } = this.state;

    analyticsLogger.logEvent("ACTION_CREATE_ORG", {"name": name, "teamName": teamName})
    this.props.createOrganization(name, teamName)

    this.props.onClose()
  }

  render() {
    const { open, onClose } = this.props

    return (
      <Modal
        title="Create a new organization and team"
        visible={open}
        onCancel={onClose}
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
        <Input
          placeholder="New Organization Name"
          name="name"
          value={this.state.name}
          onChange={this.handleInputUpdate}
          style={{ marginBottom: 20 }}
        />

        <Input
          placeholder="New Team in Organization"
          name="teamName"
          value={this.state.teamName}
          onChange={this.handleInputUpdate}
        />
      </Modal>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createOrganization }, dispatch)
}

export default NewOrganizationModal
