import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import pick from 'lodash/pick'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import EventsTable from '../events/EventsTable'
import RandomEventButton from '../events/RandomEventButton'
import DashboardLayout from '../common/DashboardLayout'
import GroupsControl from '../common/GroupsControl'
import PacketGraph from '../common/PacketGraph'
import userCan from '../../util/abilities'
import UserCan from '../common/UserCan'
import { setDeviceChannel } from '../../actions/device'
import { DEVICE_FRAGMENT } from '../../graphql/devices'

// GraphQL
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

// MUI
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
      showPairDetails: false,
      channelSelected: "",
    }

    this.handleInputUpdate = this.handleInputUpdate.bind(this);
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value})
  }

  componentDidUpdate(prevProps) {
    if (prevProps.data.loading && !this.props.data.loading) {
      this.setState({ channelSelected: this.props.data.device.channels[0].id})
    }
  }

  render() {
    const { showPairDetails, channelSelected } = this.state
    const { loading, device, organizationChannels: channels } = this.props.data

    if (loading) return <DashboardLayout />

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
            <Typography component="p">
              MAC: {device.mac}
            </Typography>
            <FormControl>
              <InputLabel htmlFor="select">Choose a Channel</InputLabel>
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
              onClick={() => this.props.setDeviceChannel(device.id, { id: channelSelected })}
            >
              Save
            </Button>
            {
              showPairDetails && <Typography component="p" style={{ marginTop: 10 }}>
                {JSON.stringify({ OUI: "Helium", id: device.id, key: "Secret Key" })}
              </Typography>
            }
          </CardContent>

          <CardActions>
            {
              false && <UserCan action="create" itemType="event">
                <RandomEventButton device_id={device.id} />
              </UserCan>
            }
            {
              !showPairDetails && <Button
                size="small"
                color="primary"
                onClick={() => this.setState({ showPairDetails: true })}
              >
                Pair Device
              </Button>
            }
          </CardActions>
        </Card>

        <Card style={{marginTop: 24}}>
          <CardContent>
            <Typography variant="headline" component="h3">
              Event Log
            </Typography>
            <EventsTable contextName="devices" contextId={device.id} />
          </CardContent>
        </Card>

        <Card style={{marginTop: 24}}>
          <CardContent>
            <Typography variant="headline" component="h3">
              Real Time Packets
            </Typography>
            <div className="chart-legend left">
              <div className="chart-legend-bulb red"></div>
              <Typography component="p">
                Live Data
              </Typography>
            </div>
            <div className="chart-legend right">
              <div className="chart-legend-bulb blue"></div>
              <Typography component="p">
                From Device
              </Typography>
              <div className="chart-legend-bulb green"></div>
              <Typography component="p">
                To Device
              </Typography>
            </div>
            <PacketGraph contextName="devices" contextId={device.id} />
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }
}

const queryOptions = {
  options: props => ({
    variables: {
      id: props.match.params.id
    }
  })
}

const query = gql`
  query DeviceShowQuery ($id: ID!) {
    device(id: $id) {
      ...DeviceFragment
      channels {
        name
        id
      }
      groups {
        name
      }
    },
    organizationChannels {
      name,
      type,
      type_name,
      id,
      active
    }
  }
  ${DEVICE_FRAGMENT}
`

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ setDeviceChannel }, dispatch)
}

const DeviceShowWithData = graphql(query, queryOptions)(DeviceShow)

export default DeviceShowWithData;
