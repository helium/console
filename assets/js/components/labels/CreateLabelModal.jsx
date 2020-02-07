import React, { Component } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createLabel } from '../../actions/label'
import analyticsLogger from '../../util/analyticsLogger'
import { Modal, Button, Typography, Input } from 'antd';
const { Text } = Typography

@connect(null, mapDispatchToProps)
class CreateLabelModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      labelName: "",
    }

    this.handleInputUpdate = this.handleInputUpdate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleSubmit(e) {
    e.preventDefault();
    const { labelName } = this.state;

    analyticsLogger.logEvent("ACTION_CREATE_LABEL", {"name": labelName})
    this.props.createLabel(labelName)

    this.props.onClose()
  }

  render() {
    const { open, onClose } = this.props

    return (
      <Modal
        title="Create New label"
        visible={open}
        onCancel={onClose}
        centered
        onOk={this.handleSubmit}
        footer={[
          <Button key="back" onClick={onClose}>
            Cancel
          </Button>,
          <Button key="submit" onClick={this.handleSubmit}>
            Create Label
          </Button>
        ]}
      >
        <Input
          placeholder="Enter Label Name"
          name="labelName"
          value={this.state.labelName}
          onChange={this.handleInputUpdate}
        />
        <Text style={{ marginBottom: 20, color: '#8C8C8C' }}>Label names must be unique</Text>
      </Modal>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createLabel }, dispatch)
}

export default CreateLabelModal
