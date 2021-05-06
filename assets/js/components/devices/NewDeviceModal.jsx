import React, { Component } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createDevice } from '../../actions/device'
import { displayError } from '../../util/messages'
import withGql from '../../graphql/withGql'
import { ALL_LABELS } from '../../graphql/labels'
import LabelTag from '../common/LabelTag'
import analyticsLogger from '../../util/analyticsLogger'
import { Modal, Button, Typography, Input, Select, Divider } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import LabelAppliedNew from '../common/LabelAppliedNew';
const { Text } = Typography
const { Option } = Select
import find from 'lodash/find'

class NewDeviceModal extends Component {
  nameInputRef = React.createRef()

  state = {
    name: "",
    devEUI: "",
    appEUI: "",
    appKey: "",
    labelName: null,
    showAppKey: false,
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.open && this.props.open) {
      this.setState({
        name: "",
        devEUI: "6081F9" + randomString(10),
        appEUI: "6081F9" + randomString(10),
        appKey: randomString(32),
        labelName: null,
      })
      if (this.nameInputRef.current) {
        this.nameInputRef.current.focus()
      }
    }
  }

  handleInputUpdate = (e) => {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { name, devEUI, appEUI, appKey, labelName } = this.state;
    if (devEUI.length === 16 && appEUI.length === 16 && appKey.length === 32)  {
      analyticsLogger.logEvent("ACTION_CREATE_DEVICE", {"name": name, "devEUI": devEUI, "appEUI": appEUI, "appKey": appKey})
      let foundLabel = find(this.props.allLabelsQuery.allLabels, { name: labelName });
      let label = foundLabel ? { labelApplied: foundLabel.id } : { newLabel: labelName };
      this.props.createDevice({ name, dev_eui: devEUI.toUpperCase(), app_eui: appEUI.toUpperCase(), app_key: appKey.toUpperCase() }, label)

      this.props.onClose()
    } else {
      displayError(`Please ensure your device credentials are of the correct length.`)
    }
  }

  render() {
    const { open, onClose } = this.props
    const { allLabels, error } = this.props.allLabelsQuery

    return (
      <Modal
        title="Add a New Device"
        visible={open}
        centered
        onCancel={onClose}
        onOk={this.handleSubmit}
        width={700}
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
          ref={this.nameInputRef}
          autoFocus
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
          value={
            this.state.showAppKey ? this.state.appKey : '✱'.repeat(28)
          }
          disabled={!this.state.showAppKey}
          onChange={this.handleInputUpdate}
          style={{ marginTop: 10 }}
          maxLength={56}
          addonBefore={
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
              App Key
              {
                this.state.showAppKey ? (
                  <EyeOutlined
                    onClick={() => this.setState({ showAppKey: !this.state.showAppKey })}
                    style={{ marginLeft: 5 }}
                  />
                ) : (
                  <EyeInvisibleOutlined
                    onClick={() => this.setState({ showAppKey: !this.state.showAppKey })}
                    style={{ marginLeft: 5 }}
                  />
                )
              }
            </div>
          }
          suffix={
            <Text type={this.state.appKey.length !== 32 ? "danger" : ""}>{Math.floor(this.state.appKey.length / 2)} / 16 Bytes</Text>
          }
        />


        <Text style={{marginTop: 30, display: 'block'}} strong>Attach a Label (Optional)</Text>
        <LabelAppliedNew
          allLabels={allLabels}
          value={this.state.labelName}
          select={value => this.setState({ labelName: value })}
        />
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

export default connect(null, mapDispatchToProps)(
  withGql(NewDeviceModal, ALL_LABELS, props => ({ fetchPolicy: 'cache-and-network', variables: {}, name: 'allLabelsQuery' }))
)
