import React, { Component } from 'react'
import { Modal, Button, Typography, Input } from 'antd';
const { Text } = Typography

class UpdateLabelModal extends Component {
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

    this.props.handleUpdateLabel(labelName)
    this.props.onClose()
  }

  render() {
    const { open, onClose } = this.props

    return (
      <Modal
        title="Label Settings"
        visible={open}
        onCancel={onClose}
        centered
        onOk={this.handleSubmit}
        footer={[
          <Button key="back" onClick={onClose}>
            Discard Changes
          </Button>,
          <Button key="submit" type="primary" onClick={this.handleSubmit}>
            Apply Changes
          </Button>
        ]}
      >
        <Input
          placeholder="Label Name"
          name="labelName"
          value={this.state.labelName}
          onChange={this.handleInputUpdate}
        />
        <Text style={{ marginBottom: 20, color: '#8C8C8C' }}>Label names must be unique</Text>
      </Modal>
    )
  }
}

export default UpdateLabelModal
