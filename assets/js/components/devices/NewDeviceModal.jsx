import React, { Component } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createDevice } from '../../actions/device'
import { displayError } from '../../util/messages'
import analyticsLogger from '../../util/analyticsLogger'
import { Modal, Button, Typography, Input } from 'antd';
const { Text } = Typography

@connect(null, mapDispatchToProps)
class NewDeviceModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: "",
      devEUI: this.randomString(16),
      appEUI: this.randomString(16),
      appKey: this.randomString(32),
    }

    this.handleInputUpdate = this.handleInputUpdate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  randomString(length) {
    let chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleSubmit(e) {
    e.preventDefault();
    const { name, devEUI, appEUI, appKey } = this.state;
    if (devEUI.length === 16 && appEUI.length === 16 && appKey.length === 32)  {
      analyticsLogger.logEvent("ACTION_CREATE_DEVICE", {"name": name, "devEUI": devEUI, "appEUI": appEUI, "appKey": appKey})
      this.props.createDevice({ name, dev_eui: devEUI.toUpperCase(), app_eui: appEUI.toUpperCase(), app_key: appKey.toUpperCase() })

      this.props.onClose()
    } else {
      displayError(`Device EUI must be exactly 8 bytes long`)
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
          addonBefore="Name"
        />

        <Input
          placeholder="Device EUI"
          name="devEUI"
          value={this.state.devEUI}
          onChange={this.handleInputUpdate}
          style={{ marginTop: 10 }}
          maxLength={16}
          addonBefore="Dev EUI"
          suffix={
            <Text type={this.state.devEUI.length !== 16 ? "danger" : ""}>{Math.floor(this.state.devEUI.length / 2)} / 8 Bytes</Text>
          }
        />

        <Input
          placeholder="App EUI"
          name="appEUI"
          value={this.state.appEUI}
          onChange={this.handleInputUpdate}
          style={{ marginTop: 10 }}
          maxLength={16}
          addonBefore="App EUI"
          suffix={
            <Text type={this.state.appEUI.length !== 16 ? "danger" : ""}>{Math.floor(this.state.appEUI.length / 2)} / 8 Bytes</Text>
          }
        />

        <Input
          placeholder="App Key"
          name="appKey"
          value={this.state.appKey}
          onChange={this.handleInputUpdate}
          style={{ marginTop: 10 }}
          maxLength={32}
          addonBefore="App Key"
          suffix={
            <Text type={this.state.appKey.length !== 32 ? "danger" : ""}>{Math.floor(this.state.appKey.length / 2)} / 16 Bytes</Text>
          }
        />
      </Modal>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createDevice }, dispatch)
}

export default NewDeviceModal
