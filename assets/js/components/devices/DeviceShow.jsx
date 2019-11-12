import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import pick from 'lodash/pick'
import find from 'lodash/find'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import EventsDashboard from '../events/EventsDashboard'
import SmallChip from '../common/SmallChip'
import UserCan from '../common/UserCan'
import DashboardLayout from '../common/DashboardLayout'
import { setDeviceChannel, deleteDeviceChannel, updateDevice } from '../../actions/device'
import { DEVICE_FRAGMENT, DEVICE_UPDATE_SUBSCRIPTION } from '../../graphql/devices'

// GraphQL
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

// MUI
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

@connect(null, mapDispatchToProps)
class DeviceShow extends Component {
  constructor(props) {
    super(props)
    this.state = {
      channelSelected: "",
      newName: "",
    }

    this.handleInputUpdate = this.handleInputUpdate.bind(this);
    this.handleAddChannel = this.handleAddChannel.bind(this);
    this.handleDeleteChannel = this.handleDeleteChannel.bind(this);
    this.handleDeviceUpdate = this.handleDeviceUpdate.bind(this);
  }

  componentDidMount() {
    const { subscribeToMore, fetchMore } = this.props.data
    const deviceId = this.props.match.params.id

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

  handleAddChannel() {
    const { channelSelected } = this.state
    const { device } = this.props.data
    this.props.setDeviceChannel(device.id, { id: channelSelected })
    this.setState({ channelSelected: "" })
  }

  handleDeleteChannel(channel_id) {
    const { device } = this.props.data
    this.props.deleteDeviceChannel(device.id, { id: channel_id })
  }

  handleDeviceUpdate(id) {
    const { newName } = this.state
    if (newName !== "") {
      this.props.updateDevice(id, { name: this.state.newName })
      this.setState({ newName: "" })
    }
  }

  render() {
    const { channelSelected, newName } = this.state
    const { loading, device, organizationChannels: channels } = this.props.data

    if (loading) return <DashboardLayout />

    const defaultChannel = find(channels, c => c.default)

    return(
      <DashboardLayout title={device.name}>
        <Card>
          <CardContent>
            <Typography variant="headline" component="h3">
              Device Details
            </Typography>
            <Typography component="p">
              Name: {device.name}
            </Typography>
            <UserCan action="update" itemType="device">
              <div>
                <TextField
                  name="newName"
                  value={this.state.newName}
                  onChange={this.handleInputUpdate}
                />
                <Button
                  size="small"
                  color="primary"
                  style={{ marginLeft: 5 }}
                  onClick={() => this.handleDeviceUpdate(device.id)}
                >
                  Update
                </Button>
              </div>
            </UserCan>
            <div style={{ padding: 10, backgroundColor: '#F0F0F0', marginTop: 10, borderRadius: 5, boxShadow: 'inset 1px 1px 3px #999' }}>
              <Typography variant="caption">
                {`const uint32_t oui = ${device.oui};`}
              </Typography>
              <Typography variant="caption">
                {`const uint16_t device_id = ${device.seq_id};`}
              </Typography>
              <Typography variant="caption">
                {`const uint8_t preshared_key[16] = {${device.key}};`}
              </Typography>
            </div>
            <FormControl>
              <InputLabel htmlFor="select">Connect Channel</InputLabel>
              <Select
                value={channelSelected}
                onChange={this.handleInputUpdate}
                inputProps={{
                  name: 'channelSelected',
                }}
                style={{ width: 200 }}
              >
                {channels.map(c => (
                  <MenuItem value={c.id} key={c.id}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              size="small"
              color="primary"
              style={{ marginLeft: 5 }}
              onClick={this.handleAddChannel}
            >
              Add
            </Button>
            <div style={{ marginTop: 10 }}>
              {
                device.channels.map(c => (
                  <SmallChip key={c.id} label={c.name} onDelete={() => this.handleDeleteChannel(c.id)} style={{ marginRight: 5 }} />
                ))
              }
              {
                device.channels.length === 0 && channels.length > 0 && defaultChannel && (
                  <SmallChip label={`Default: ${defaultChannel.name}`} />
                )
              }
            </div>
          </CardContent>
        </Card>

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
