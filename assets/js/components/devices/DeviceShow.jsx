import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import OutsideClick from 'react-outside-click-handler';
import pick from 'lodash/pick'
import find from 'lodash/find'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import EventsDashboard from '../events/EventsDashboard'
import UserCan from '../common/UserCan'
import DashboardLayout from '../common/DashboardLayout'
import { updateDevice } from '../../actions/device'
import { DEVICE_FRAGMENT, DEVICE_UPDATE_SUBSCRIPTION } from '../../graphql/devices'
import analyticsLogger from '../../util/analyticsLogger'
import { displayError } from '../../util/messages'
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Typography, Button, Input, Icon, Select, Tag } from 'antd';
import { Card } from 'antd';
import DeviceCredentials from './DeviceCredentials'

const { Text } = Typography
const { Option } = Select

@connect(null, mapDispatchToProps)
class DeviceShow extends Component {
  constructor(props) {
    super(props)
    this.state = {
      newName: "",
      newDevEUI: "",
      newAppEUI: "",
      newAppKey: "",
      showNameInput: false,
      showDevEUIInput: false,
      showAppEUIInput: false,
      showAppKeyInput: false,
    }

    this.handleInputUpdate = this.handleInputUpdate.bind(this);
    this.handleDeviceNameUpdate = this.handleDeviceNameUpdate.bind(this);
    this.handleDeviceEUIUpdate = this.handleDeviceEUIUpdate.bind(this);
    this.handleAppEUIUpdate = this.handleAppEUIUpdate.bind(this);
    this.toggleNameInput = this.toggleNameInput.bind(this);
    this.toggleDevEUIInput = this.toggleDevEUIInput.bind(this);
    this.toggleAppEUIInput = this.toggleAppEUIInput.bind(this);
    this.toggleAppKeyInput = this.toggleAppKeyInput.bind(this);
  }

  componentDidMount() {
    const { subscribeToMore, fetchMore } = this.props.data
    const deviceId = this.props.match.params.id

    analyticsLogger.logEvent("ACTION_NAV_DEVICE_SHOW", {"id": deviceId})

    subscribeToMore({
      document: DEVICE_UPDATE_SUBSCRIPTION,
      variables: { deviceId },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        fetchMore({
          updateQuery: (prev, { fetchMoreResult }) => fetchMoreResult
        })
      }
    })
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleDeviceNameUpdate(id) {
    const { newName } = this.state
    if (newName !== "") {
      this.props.updateDevice(id, { name: this.state.newName })
      analyticsLogger.logEvent("ACTION_RENAME_DEVICE", {"id": id, "name": newName })
    }
    this.setState({ newName: "", showNameInput: false })
  }

  handleDeviceEUIUpdate(id) {
    const { newDevEUI } = this.state
    if (newDevEUI.length === 16) {
      this.props.updateDevice(id, { dev_eui: this.state.newDevEUI.toUpperCase() })
      analyticsLogger.logEvent("ACTION_RENAME_DEVICE", {"id": id, "dev_eui": newDevEUI })
      return this.setState({ newDevEUI: "", showDevEUIInput: false })
    }
    if (newDevEUI === "") {
      this.setState({ newDevEUI: "", showDevEUIInput: false })
    } else {
      displayError(`Device EUI must be exactly 8 bytes long`)
    }
  }

  handleAppEUIUpdate(id) {
    const { newAppEUI } = this.state
    if (newAppEUI.length === 16) {
      this.props.updateDevice(id, { app_eui: this.state.newAppEUI.toUpperCase() })
      analyticsLogger.logEvent("ACTION_RENAME_DEVICE", {"id": id, "app_eui": newAppEUI })
      return this.setState({ newAppEUI: "", showAppEUIInput: false })
    }
    if (newAppEUI === "") {
      this.setState({ newAppEUI: "", showAppEUIInput: false })
    } else {
      displayError(`App EUI must be exactly 8 bytes long`)
    }
  }

  handleAppKeyUpdate(id) {
    const { newAppKey } = this.state
    if (newAppKey.length === 32) {
      this.props.updateDevice(id, { app_key: this.state.newAppKey.toUpperCase() })
      analyticsLogger.logEvent("ACTION_RENAME_DEVICE", {"id": id, "app_key": newAppKey })
      return this.setState({ newAppKey: "", showAppKeyInput: false })
    }
    if (newAppKey === "") {
      this.setState({ newAppKey: "", showAppKeyInput: false })
    } else {
      displayError(`App Key must be exactly 16 bytes long`)
    }
  }

  toggleNameInput() {
    const { showNameInput } = this.state
    this.setState({ showNameInput: !showNameInput })
  }

  toggleDevEUIInput() {
    const { showDevEUIInput } = this.state
    this.setState({ showDevEUIInput: !showDevEUIInput })
  }

  toggleAppEUIInput() {
    const { showAppEUIInput } = this.state
    this.setState({ showAppEUIInput: !showAppEUIInput })
  }

  toggleAppKeyInput() {
    const { showAppKeyInput } = this.state
    this.setState({ showAppKeyInput: !showAppKeyInput })
  }

  render() {
    const { newName, showNameInput, showDevEUIInput, showAppEUIInput, showAppKeyInput } = this.state
    const { loading, device } = this.props.data

    if (loading) return <DashboardLayout />

    return(
      <DashboardLayout title={`${device.name}`}>
        <Card title="Device Details">

          <table>
            <tbody>
              <tr style={{height: '30px'}}>
                <td style={{width: '200px'}}><Text strong>Name</Text></td>
                <td>
                  {showNameInput ? (
                    <OutsideClick
                      onOutsideClick={this.toggleNameInput}
                    >
                      <Input
                        name="newName"
                        placeholder={device.name}
                        value={this.state.newName}
                        onChange={this.handleInputUpdate}
                        style={{ width: 200, marginRight: 5 }}
                      />
                      <Button
                        type="primary"
                        onClick={() => this.handleDeviceNameUpdate(device.id)}
                      >
                        Update
                      </Button>
                    </OutsideClick>

                  ) : (
                    <React.Fragment>
                      <Text  style={{ marginRight: 5 }}>{device.name} </Text>
                      <Tag color="blue" size="small" onClick={this.toggleNameInput}>
                        <Icon type="edit"></Icon>
                      </Tag>
                    </React.Fragment>
                  )}
                </td>
              </tr>
              <tr style={{height: '30px'}}>
                <td><Text strong>Device EUI</Text></td>
                <td>
                  {showDevEUIInput && (
                    <OutsideClick
                      onOutsideClick={this.toggleDevEUIInput}
                    >
                      <Input
                        name="newDevEUI"
                        placeholder={device.dev_eui}
                        value={this.state.newDevEUI}
                        onChange={this.handleInputUpdate}
                        maxLength={16}
                        style={{ width: 200, marginRight: 5 }}
                      />
                      <Button
                        type="primary"
                        onClick={() => this.handleDeviceEUIUpdate(device.id)}
                      >
                        Update
                      </Button>
                    </OutsideClick>
                  )}
                  {!showDevEUIInput && (
                    <React.Fragment>
                      {
                        device.dev_eui && device.dev_eui.length === 16 ? <DeviceCredentials data={device.dev_eui} /> : <Text style={{ marginRight: 5 }}>Add a Device EUI</Text>
                      }
                      <Tag color="blue" size="small" onClick={this.toggleDevEUIInput}>
                        <Icon type="edit"></Icon>
                      </Tag>
                    </React.Fragment>
                  )}
                </td>
              </tr>
              <tr style={{height: '30px'}}>
                <td><Text strong>App EUI</Text></td>
                <td>
                  {showAppEUIInput && (
                    <OutsideClick
                      onOutsideClick={this.toggleAppEUIInput}
                    >
                      <Input
                        name="newAppEUI"
                        placeholder={device.app_eui}
                        value={this.state.newAppEUI}
                        onChange={this.handleInputUpdate}
                        maxLength={16}
                        style={{ width: 200, marginRight: 5 }}
                      />
                      <Button
                        type="primary"
                        onClick={() => this.handleAppEUIUpdate(device.id)}
                      >
                        Update
                      </Button>
                    </OutsideClick>
                  )}
                  {!showAppEUIInput && (
                    <React.Fragment>
                      {
                        device.app_eui && device.app_eui.length === 16 ? <DeviceCredentials data={device.app_eui} /> : <Text style={{ marginRight: 5 }}>Add a App EUI</Text>
                      }
                      <Tag color="blue" size="small" onClick={this.toggleAppEUIInput}>
                        <Icon type="edit"></Icon>
                      </Tag>
                    </React.Fragment>
                  )}
                </td>
              </tr>
              <tr style={{height: '30px'}}>
                <td><Text strong>App Key</Text></td>
                <td>
                  {showAppKeyInput && (
                    <OutsideClick
                      onOutsideClick={this.toggleAppKeyInput}
                    >
                      <Input
                        name="newAppKey"
                        placeholder={device.app_key}
                        value={this.state.newAppKey}
                        onChange={this.handleInputUpdate}
                        maxLength={32}
                        style={{ width: 300, marginRight: 5 }}
                      />
                      <Button
                        type="primary"
                        onClick={() => this.handleAppKeyUpdate(device.id)}
                      >
                        Update
                      </Button>
                    </OutsideClick>
                  )}
                  {!showAppKeyInput && (
                    <React.Fragment>
                      {
                        device.app_key && device.app_key.length === 32 ? <DeviceCredentials data={device.app_key} /> : <Text style={{ marginRight: 5 }}>Add a App Key</Text>
                      }
                      <Tag color="blue" size="small" onClick={this.toggleAppKeyInput}>
                        <Icon type="edit"></Icon>
                      </Tag>
                    </React.Fragment>
                  )}
                </td>
              </tr>
              <tr style={{height: '30px'}}>
                <td style={{width: '150px'}}><Text strong>Activation Method</Text></td>
                <td><Tag color="green">OTAA</Tag></td>
              </tr>
              <tr style={{height: '30px'}}>
                <td><Text strong>LoRaWAN US Channels</Text></td>
                <td><Text>48-55 (sub-band 7)</Text></td>
              </tr>
            </tbody>
          </table>
        </Card>

        <Card title="Device Integrations">
          <EventsDashboard contextName="devices" contextId={device.id} />
        </Card>
      </DashboardLayout>
    )
  }
}

const queryOptions = {
  options: props => ({
    variables: {
      id: props.match.params.id
    },
    fetchPolicy: 'cache-and-network',
  })
}

const query = gql`
  query DeviceShowQuery ($id: ID!) {
    device(id: $id) {
      ...DeviceFragment
      app_key
      oui
    }
  }
  ${DEVICE_FRAGMENT}
`

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ updateDevice }, dispatch)
}

const DeviceShowWithData = graphql(query, queryOptions)(DeviceShow)

export default DeviceShowWithData
