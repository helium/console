import React, { Component } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createOrganization } from '../../actions/organization'
import analyticsLogger from '../../util/analyticsLogger'
import { Modal, Button, Typography, Input } from 'antd';
const { Text } = Typography

@connect(null, mapDispatchToProps)
class NewOrganizationModal extends Component {
  state = {
    name: "",
  }

  handleInputUpdate = (e) => {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { name } = this.state;

    analyticsLogger.logEvent("ACTION_CREATE_ORG", {"name": name})
    this.props.createOrganization(name)

    this.props.onClose()
    this.setState({ name: "" });
  }

  render() {
    const { open, onClose } = this.props

    return (
      <Modal
        title="Create a new organization"
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
        <Input
          placeholder="New Organization Name"
          name="name"
          value={this.state.name}
          onChange={this.handleInputUpdate}
          style={{ marginBottom: 20 }}
        />
      </Modal>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createOrganization }, dispatch)
}

export default NewOrganizationModal
