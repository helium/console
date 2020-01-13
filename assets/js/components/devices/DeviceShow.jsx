import React, { Component } from 'react'
import { Link } from 'react-router-dom'
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
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Typography, Button, Input, Form, Select, Tag } from 'antd';
const { Text } = Typography
const { Option } = Select

@connect(null, mapDispatchToProps)
class DeviceShow extends Component {
  constructor(props) {
    super(props)
    this.state = {
      channelSelected: "",
      newName: "",
    }

    this.handleInputUpdate = this.handleInputUpdate.bind(this);
    this.handleSelectUpdate = this.handleSelectUpdate.bind(this);
    this.handleAddChannel = this.handleAddChannel.bind(this);
    this.handleDeleteChannel = this.handleDeleteChannel.bind(this);
    this.handleDeviceUpdate = this.handleDeviceUpdate.bind(this);
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

  handleDeviceUpdate(id) {
    const { newName } = this.state
    if (newName !== "") {
      this.props.updateDevice(id, { name: this.state.newName })
      analyticsLogger.logEvent("ACTION_RENAME_DEVICE", {"id": id, "name": newName })
      this.setState({ newName: "" })
    }
  }

  render() {
    const { channelSelected, newName } = this.state
    const { loading, device, organizationChannels: channels } = this.props.data

    if (loading) return <DashboardLayout />

    const defaultChannel = find(channels, c => c.default)

    return(
      <DashboardLayout title={`Device: ${device.name}`}>
        <Text strong>
          Device Details
        </Text>
        <br />
        <UserCan action="update" itemType="device">
          <Input
            name="newName"
            placeholder={device.name}
            value={this.state.newName}
            onChange={this.handleInputUpdate}
            style={{ width: 150 }}
          />
          <Button
            type="primary"
            onClick={() => this.handleDeviceUpdate(device.id)}
          >
            Update
          </Button>
        </UserCan>
        <div>
          <Text code>
            {`const uint32_t oui = ${device.oui};`}
          </Text>
          <br />
          <Text code>
            {`const uint16_t device_id = ${device.seq_id};`}
          </Text>
          <br />
          <Text code>
            {`const uint8_t preshared_key[16] = {${device.key}};`}
          </Text>
        </div>

        <Text strong>
          Device Channels
        </Text>
        <br />
        <Select
          placeholder="Select Channel"
          onChange={this.handleSelectUpdate}
          style={{ width: 150 }}
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

export default DeviceShowWithData;
