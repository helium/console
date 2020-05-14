import React, { Component } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createDevice } from '../../actions/device'
import { displayError } from '../../util/messages'
import { graphql } from 'react-apollo';
import { ALL_LABELS } from '../../graphql/labels'
import LabelTag from '../common/LabelTag'
import analyticsLogger from '../../util/analyticsLogger'
import { Modal, Button, Typography, Input, Select, Divider } from 'antd';
const { Text } = Typography
const { Option } = Select

const queryOptions = {
  options: props => ({
    fetchPolicy: 'cache-and-network',
  })
}

@connect(null, mapDispatchToProps)
@graphql(ALL_LABELS, queryOptions)
class NewDeviceModal extends Component {
  state = {
    name: "",
    devEUI: randomString(16),
    appEUI: randomString(16),
    appKey: randomString(32),
    labelId: null,
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.open && this.props.open) {
      this.setState({
        name: "",
        devEUI: randomString(16),
        appEUI: randomString(16),
        appKey: randomString(32),
        labelId: null,
      })
    }
  }

  handleInputUpdate = (e) => {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { name, devEUI, appEUI, appKey, labelId } = this.state;
    if (devEUI.length === 16 && appEUI.length === 16 && appKey.length === 32)  {
      analyticsLogger.logEvent("ACTION_CREATE_DEVICE", {"name": name, "devEUI": devEUI, "appEUI": appEUI, "appKey": appKey})
      this.props.createDevice({ name, dev_eui: devEUI.toUpperCase(), app_eui: appEUI.toUpperCase(), app_key: appKey.toUpperCase() }, labelId)

      this.props.onClose()
    } else {
      displayError(`Please ensure your device credentials are of the correct length.`)
    }
  }

  handleSelectOption = (labelId) => {
    this.setState({ labelId })
  }

  render() {
    const { open, onClose } = this.props
    const { allLabels, error } = this.props.data

    return (
      <Modal
        title="Create a New Device"
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

        <Divider />

        <Text strong>Attach a Label (Optional)</Text><br />
        <Select
          placeholder={error ? "No Labels found..." : "Choose Label"}
          style={{ width: 220, marginRight: 10, marginTop: 10 }}
          onSelect={this.handleSelectOption}
        >
          {
            allLabels && allLabels.map(l => (
              <Option value={l.id} key={l.id}>
                <LabelTag text={l.name} color={l.color} hasIntegrations={l.channels.length > 0} hasFunction={l.function}/>
              </Option>
            ))
          }
        </Select>
      </Modal>
    )
  }
}

const randomString = length => {
  let chars = "0123456789ABCDEF";
  let result = '';
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createDevice }, dispatch)
}

export default NewDeviceModal
