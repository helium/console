import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import pick from 'lodash/pick'
import { fetchChannel, deleteChannel, updateChannel } from '../../actions/channel'
import EventsTable from '../events/EventsTable'
import RandomEventButton from '../events/RandomEventButton'
import DashboardLayout from '../common/DashboardLayout'
import HttpDetails from './HttpDetails'
import GroupsControl from '../common/GroupsControl'
import userCan from '../../util/abilities'

// MUI
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Card, { CardActions, CardContent } from 'material-ui/Card';

class ChannelShow extends Component {
  componentDidMount() {
    const { id } = this.props.match.params
    this.props.fetchChannel(id)
  }

  render() {
    const { channel, events, deleteChannel, updateChannel } = this.props

    if (channel === undefined) return (<div>loading...</div>)

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
                  ID: {channel.id}
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
                  groups={channel.groups}
                  handleUpdate={(groups) => updateChannel(channel.id, {groups: groups})}
                  editable={userCan('update', 'channel', channel)}
                />
              </div>
            </div>
          </CardContent>

          <CardActions>
            {userCan('create', 'event') &&
              <RandomEventButton channel_id={channel.id} />
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
            <EventsTable events={events} />
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }
}

function mapStateToProps(state, ownProps) {
  const channel = state.entities.channels[ownProps.match.params.id]
  if (channel === undefined) return {}
  return {
    channel,
    events: Object.values(pick(state.entities.events, channel.events))
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchChannel, deleteChannel, updateChannel }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelShow);
