import React, { Component } from 'react'
import { Modal, Button, Typography, Input, Divider, Select } from 'antd';
import LabelTag, { labelColors } from '../common/LabelTag'
const { Text } = Typography
const { Option } = Select

class UpdateLabelModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      labelName: null,
      color: props.label.color || labelColors[0]
    }

    this.handleInputUpdate = this.handleInputUpdate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleColorSelect = this.handleColorSelect.bind(this);
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleColorSelect(color) {
    this.setState({ color })
  }

  handleSubmit(e) {
    e.preventDefault();
    const { labelName, color } = this.state;

    this.props.handleUpdateLabel(labelName, color)
    this.props.onClose()
  }

  render() {
    const { open, onClose, label } = this.props

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
        <Text>Label Name</Text>
        <Input
          placeholder={label.name}
          name="labelName"
          value={this.state.labelName}
          onChange={this.handleInputUpdate}
        />
        <Text style={{ color: '#8C8C8C' }}>Label names must be unique</Text>
        <Divider />
        <Text>Pick a Color</Text>
        <Select defaultValue={label.color || labelColors[0]} style={{ width: '100%' }} name="color" onChange={this.handleColorSelect}>
          {
            labelColors.map((c,i) => (
              <Option key={i} value={c}><LabelTag text="Label Name" color={c} /></Option>
            ))
          }
        </Select>
      </Modal>
    )
  }
}

export default UpdateLabelModal
