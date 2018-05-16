import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import pick from 'lodash/pick'
import { fetchDevice, deleteDevice, updateDevice } from '../../actions/device'
import EventsTable from '../events/EventsTablePaginated'
import RandomEventButton from '../events/RandomEventButton'
import DashboardLayout from '../common/DashboardLayout'
import GroupsControl from '../common/GroupsControl'
import PacketGraph from '../common/PacketGraph'
import userCan from '../../util/abilities'

// GraphQL
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

// MUI
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Card, { CardActions, CardContent } from 'material-ui/Card';

class DeviceShow extends Component {
  componentDidMount() {
    const { fetchDevice } = this.props
    const { id } = this.props.match.params
    fetchDevice(id)

    this.fetchEventsNextPage = this.fetchEventsNextPage.bind(this)
    this.fetchEventsPreviousPage = this.fetchEventsPreviousPage.bind(this)
  }

  fetchEventsNextPage() {
    const { id } = this.props.match.params
    const { fetchMore } = this.props.data
    const after = this.props.data.device.events.pageInfo.endCursor

    fetchMore({
      variables: { after },
      updateQuery: (prev, { fetchMoreResult }) => fetchMoreResult
    })
  }

  fetchEventsPreviousPage() {
    const { id } = this.props.match.params
    const { fetchMore } = this.props.data
    const before = this.props.data.device.events.pageInfo.startCursor

    fetchMore({
      variables: { last: 5, first: undefined, before },
      updateQuery: (prev, { fetchMoreResult }) => fetchMoreResult
    })
  }

  render() {
    const { id } = this.props.match.params
    const { deleteDevice, updateDevice } = this.props
    const { loading, device } = this.props.data

    if (loading) return <DashboardLayout />

    return(
      <DashboardLayout title={device.name}>
        <Card>
          <CardContent>
            <Typography variant="headline" component="h3">
              Device Details
            </Typography>

            <div style={{display: 'flex'}}>
              <div style={{width: '50%'}}>
                <Typography component="p">
                  ID: {device.id}
                </Typography>
                <Typography component="p">
                  Name: {device.name}
                </Typography>
                <Typography component="p">
                  MAC: {device.mac}
                </Typography>
              </div>
              <div style={{width: '50%'}}>
                <GroupsControl
                  groups={device.groups}
                  handleUpdate={(groups) => updateDevice(id, {groups: groups})}
                  editable={userCan('update', 'device', device)}
                />
              </div>
            </div>
          </CardContent>

          <CardActions>
            {userCan('create', 'event') &&
              <RandomEventButton device_id={id} />
            }
            {userCan('delete', 'device', device) &&
              <Button
                size="small"
                color="secondary"
                onClick={() => deleteDevice(id)}
              >
                Delete Device
              </Button>
            }
          </CardActions>
        </Card>

        <Card style={{marginTop: 24}}>
          <CardContent>
            <Typography variant="headline" component="h3">
              Event Log
            </Typography>
            <EventsTable
              events={device.events}
              handleNextPage={this.fetchEventsNextPage}
              handlePreviousPage={this.fetchEventsPreviousPage}
            />
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
            <PacketGraph data={this.props.events}/>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }
}

function mapStateToProps(state, ownProps) {
  const device = state.entities.devices[ownProps.match.params.id]
  if (device === undefined) return {}
  return {
    device,
    events: Object.values(pick(state.entities.events, device.events))
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchDevice, deleteDevice, updateDevice }, dispatch);
}

const queryOptions = {
  options: props => ({
    variables: {
      id: props.match.params.id,
      first: 5
    }
  })
}

const query = gql`
  query DeviceShowQuery ($id: ID!, $first: Int, $last: Int, $after: String, $before: String) {
    device(id: $id) {
      name,
      mac,
      id,
      events(first: $first, last: $last, after: $after, before: $before) {
        edges {
          node {
            id,
            description,
            rssi,
            payload_size,
            reported_at,
            status
          }
        },
        pageInfo {
          endCursor
          startCursor,
          hasNextPage,
          hasPreviousPage
        }
      }
    }
  }
`

const DeviceShowWithData = graphql(query, queryOptions)(DeviceShow)

export default connect(mapStateToProps, mapDispatchToProps)(DeviceShowWithData);
