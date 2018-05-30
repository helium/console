import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import pick from 'lodash/pick'
import { deleteChannel, updateChannel } from '../../actions/channel'
import EventsTable from '../events/EventsTablePaginated'
import RandomEventButton from '../events/RandomEventButton'
import DashboardLayout from '../common/DashboardLayout'
import HttpDetails from './HttpDetails'
import GroupsControl from '../common/GroupsControl'
import PacketGraph from '../common/PacketGraph'
import userCan from '../../util/abilities'

// GraphQL
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

// MUI
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';

class ChannelShow extends Component {
  render() {
    const { deleteChannel, updateChannel } = this.props
    const { loading, channel } = this.props.data

    if (loading) return <DashboardLayout />

    return(
      <DashboardLayout title={channel.name}>
        <Card>
          <CardContent>
            <Typography variant="headline" component="h3">
              Channel Details
            </Typography>

            <div style={{display: 'flex'}}>
              <div style={{width: '50%'}}>
                <Typography component="p">
                  ID: {channel._id}
                </Typography>
                <Typography component="p">
                  Name: {channel.name}
                </Typography>
                <Typography component="p">
                  Type: {channel.type}
                </Typography>
                <Typography component="p">
                  Active: {channel.active ? "Yes" : "No"}
                </Typography>
              </div>
              <div style={{width: '50%'}}>
                <GroupsControl
                  groups={channel.groups.edges.map(e => e.node.name)}
                  handleUpdate={(groups) => updateChannel(channel._id, {groups: groups})}
                  editable={userCan('update', 'channel', channel)}
                />
              </div>
            </div>
          </CardContent>

          <CardActions>
            {userCan('create', 'event') &&
              <RandomEventButton channel_id={channel._id} />
            }

            {userCan('delete', 'channel', channel) &&
              <Button
                size="small"
                color="secondary"
                onClick={() => deleteChannel(channel)}
              >
                Delete Channel
              </Button>
            }
          </CardActions>
        </Card>

        {channel.type === "http" && <HttpDetails channel={channel} />}

        <Card style={{marginTop: 24}}>
          <CardContent>
            <Typography variant="headline" component="h3">
              Event Log
            </Typography>
            <EventsTable contextId={channel._id} contextName="channels"/>
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
  return {}
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ deleteChannel, updateChannel }, dispatch);
}

const queryOptions = {
  options: props => ({
    variables: {
      id: props.match.params.id
    }
  })
}

const query = gql`
  query ChannelShowQuery ($id: ID!) {
    channel(id: $id) {
      name,
      type,
      active,
      id,
      _id,
      groups(first: 100) {
        edges {
          node {
            name
          }
        }
      }
    }
  }
`

const ChannelShowWithData = graphql(query, queryOptions)(ChannelShow)

export default connect(mapStateToProps, mapDispatchToProps)(ChannelShowWithData);
