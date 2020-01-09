import React, { Component } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createTeamUnderOrg } from '../../actions/team'
import analyticsLogger from '../../util/analyticsLogger'
import { Modal, Button, Typography, Input } from 'antd';
const { Text } = Typography

@connect(null, mapDispatchToProps)
class NewTeamModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: ""
    }

    this.handleInputUpdate = this.handleInputUpdate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleSubmit(e) {
    e.preventDefault();
    const { name } = this.state;
    const { organizationId } = this.props

    analyticsLogger.logEvent("ACTION_CREATE_TEAM", {"id": organizationId, "teamName": name})
    this.props.createTeamUnderOrg(organizationId, name);

    this.props.onClose()
  }

  render() {
    const { open, onClose, classes, organizationName } = this.props

    return (
      <Modal
        title={`Create a new team under organization: ${organizationName}`}
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
          placeholder="New Team Name"
          name="name"
          value={this.state.name}
          onChange={this.handleInputUpdate}
        />
      </Modal>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createTeamUnderOrg }, dispatch)
}

export default NewTeamModal
