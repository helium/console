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
import { setDeviceChannel, deleteDeviceChannel, updateDevice } from '../../actions/device'
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
      channelSelected: "",
      newName: "",
      newDevEUI: "",
      showNameInput: false,
      showDevEUIInput: false,
    }

    this.handleInputUpdate = this.handleInputUpdate.bind(this);
    this.handleSelectUpdate = this.handleSelectUpdate.bind(this);
    this.handleAddChannel = this.handleAddChannel.bind(this);
    this.handleDeleteChannel = this.handleDeleteChannel.bind(this);
    this.handleDeviceNameUpdate = this.handleDeviceNameUpdate.bind(this);
    this.handleDeviceEUIUpdate = this.handleDeviceEUIUpdate.bind(this);
    this.toggleNameInput = this.toggleNameInput.bind(this);
    this.toggleDevEUIInput = this.toggleDevEUIInput.bind(this);
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

  handleSelectUpdate(channelSelected) {
    this.setState({ channelSelected })
  }

  handleAddChannel() {
    const { channelSelected } = this.state
    const { device } = this.props.data
    this.props.setDeviceChannel(device.id, { id: channelSelected })
    analyticsLogger.logEvent("ACTION_ADD_DEVICE_CHANNEL", {"id": device.id})
    this.setState({ channelSelected: "" })
  }

  handleDeleteChannel(channel_id) {
    const { device } = this.props.data
    analyticsLogger.logEvent("ACTION_DELETE_DEVICE_CHANNEL", {"id": device.id})
    this.props.deleteDeviceChannel(device.id, { id: channel_id })
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

  toggleNameInput() {
    const { showNameInput } = this.state
    this.setState({ showNameInput: !showNameInput })
  }

  toggleDevEUIInput() {
    const { showDevEUIInput } = this.state
    this.setState({ showDevEUIInput: !showDevEUIInput })
  }

  render() {
    const { channelSelected, newName, showNameInput, showDevEUIInput } = this.state
    const { loading, device, organizationChannels: channels } = this.props.data

    if (loading) return <DashboardLayout />

    const appEUI = ('00000000' + device.oui.toString(16).toUpperCase()).slice(-8) + ('00000000' + device.seq_id.toString(16).toUpperCase()).slice(-8)

    const defaultChannel = find(channels, c => c.default)

    return(
      <DashboardLayout title={`${device.name}`}>
        <Card title="Device Details">

          <table>
            <tbody>
              <tr style={{height: '30px'}}>
                <td style={{width: '200px'}}><Text strong>Name</Text></td>
                <td>
                  {showNameInput ? (
                    <UserCan action="update" itemType="device">
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
                    </UserCan>
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
                    <UserCan action="update" itemType="device">
                      <OutsideClick
                        onOutsideClick={this.toggleDevEUIInput}
                      >
                        <Input
                          name="newDevEUI"
                          placeholder={device.dev_eui}
                          value={this.state.newDevEUI}
                          onChange={this.handleInputUpdate}
                          maxLength={16}
                          style={{ width: 150, marginRight: 5 }}
                        />
                        <Button
                          type="primary"
                          onClick={() => this.handleDeviceEUIUpdate(device.id)}
                        >
                          Update
                        </Button>
                      </OutsideClick>
                    </UserCan>
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
                <td><DeviceCredentials data={appEUI} /></td>
              </tr>
              <tr style={{height: '30px'}}>
                <td><Text strong>App Key</Text></td>
                <td><DeviceCredentials data={device.key} /></td>
              </tr>
              <tr style={{height: '30px'}}>
                <td style={{width: '150px'}}><Text strong>Activation Method</Text></td>
                <td><Tag color="blue">OTAA</Tag></td>
              </tr>
              <tr style={{height: '30px'}}>
                <td><Text strong>LoRaWAN US Channels</Text></td>
                <td><Text>48-55 (sub-band 7)</Text></td>
              </tr>
            </tbody>
          </table>
        </Card>

        <Card title="Device Integrations">
        <Select
          placeholder="Select Integration"
          onChange={this.handleSelectUpdate}
          style={{ width: 200, marginRight: 5 }}
        >
          {channels.map(c => (
            <Option value={c.id} key={c.id}>{c.name}</Option>
          ))}
        </Select>

        <Button
          type="primary"
          onClick={this.handleAddChannel}
        >
          Add
        </Button>
                </Card>
<Card title="Real Time Packets">
        <div>
          {
            device.channels.map(c => (
              <Tag key={c.id} closable onClose={() => this.handleDeleteChannel(c.id)}>{`Channel: ${c.name}`}</Tag>
            ))
          }
          {
            device.channels.length === 0 && channels.length > 0 && defaultChannel && (
              <Tag>{`Default Channel: ${defaultChannel.name}`}</Tag>
            )
          }
        </div>
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
      key
      oui
      channels {
        name
        id
      }
    },
    organizationChannels {
      name,
      type,
      type_name,
      id,
      active,
      default
    }
  }
  ${DEVICE_FRAGMENT}
`

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ setDeviceChannel, deleteDeviceChannel, updateDevice }, dispatch)
}

const DeviceShowWithData = graphql(query, queryOptions)(DeviceShow)

export default DeviceShowWithData
