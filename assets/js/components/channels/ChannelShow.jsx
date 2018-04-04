import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import pick from 'lodash/pick'
import { fetchChannel } from '../../actions/channel'
import EventsTable from '../events/EventsTable'
import DashboardLayout from '../DashboardLayout'
import RandomEventButton from '../events/RandomEventButton'
import DeleteChannelButton from './DeleteChannelButton'

class ChannelShow extends Component {
  componentDidMount() {
    const { id } = this.props.match.params
    this.props.fetchChannel(id)
  }

  render() {
    const { channel, events } = this.props

    if (channel === undefined) return (<div>loading...</div>)

    return(
      <DashboardLayout title="Channel" current="channels">
        <p>ID: {channel.id}</p>
        <p>Name: {channel.name}</p>
        <p>Type: {channel.type}</p>
        <p>Active: {channel.active ? "Yes" : "No"}</p>

        <RandomEventButton channel_id={channel.id} />
        <DeleteChannelButton channel={channel} />
        <EventsTable events={events} />
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
  return bindActionCreators({ fetchChannel }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelShow);
