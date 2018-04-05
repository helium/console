import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { fetchChannels } from '../../actions/channel'
import DashboardLayout from '../DashboardLayout'
import RandomChannelButton from './RandomChannelButton'

class ChannelIndex extends Component {
  componentDidMount() {
    this.props.fetchChannels()
  }

  render() {
    const { channels } = this.props

    return(
      <DashboardLayout title="Channels" current="channels">
        <h4>Create New Channel</h4>
        <div><Link to={'/channels/new?kind=azure'}>Azure IoT Hub</Link></div>
        <div><Link to={'/channels/new?kind=aws'}>AWS IoT</Link></div>
        <div><Link to={'/channels/new?kind=google'}>Google Cloud IoT Core</Link></div>
        <div><Link to={'/channels/new?kind=mqtt'}>MQTT</Link></div>
        <div><Link to={'/channels/new?kind=http'}>HTTP</Link></div>

        <h4>All Channels</h4>
        {channels.length > 0 ? (
          <ul>
            {channels.map(channel => <li key={channel.id}>
              <Link to={`/channels/${channel.id}`}>{channel.name}</Link>
            </li>)}
          </ul>
        ) : (
          <p>No channels</p>
        )}
        <RandomChannelButton />
      </DashboardLayout>
    )
  }
}

function mapStateToProps(state) {
  return {
    channels: Object.values(state.entities.channels)
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchChannels }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelIndex);
