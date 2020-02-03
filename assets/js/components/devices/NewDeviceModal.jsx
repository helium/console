import React, { Component } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createDevice } from '../../actions/device'
import { randomMac } from '../../util/random'
import { displayInfo } from '../../util/messages'
import analyticsLogger from '../../util/analyticsLogger'
import { Modal, Button, Typography, Input } from 'antd';
const { Text } = Typography

@connect(null, mapDispatchToProps)
class NewDeviceModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: "",
      devEUI: "",
    }

    this.handleInputUpdate = this.handleInputUpdate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleSubmit(e) {
    e.preventDefault();
    const { name, devEUI } = this.state;
    if (devEUI.length === 16) {
      analyticsLogger.logEvent("ACTION_CREATE_DEVICE", {"name": name, "devEUI": devEUI})
      this.props.createDevice({ name, mac: randomMac(), dev_eui: devEUI })

      this.props.onClose()
    } else {
      displayInfo(`Device EUI must be 8 bytes long`)
    }
  }

  render() {
    const { open, onClose, classes } = this.props

    return (
      <Modal
        title="Create a new device"
        visible={open}
        centered
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
          placeholder="Device Name"
          name="name"
          value={this.state.name}
          onChange={this.handleInputUpdate}
        />

        <Input
          placeholder="Device EUI"
          name="devEUI"
          value={this.state.devEUI}
          onChange={this.handleInputUpdate}
          style={{ marginTop: 10 }}
        />
      </Modal>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createDevice }, dispatch)
}

export default NewDeviceModal
