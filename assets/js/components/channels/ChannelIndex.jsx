import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { fetchChannels } from '../../actions/channel'
import DashboardLayout from '../DashboardLayout'

class ChannelIndex extends Component {
  componentDidMount() {
    this.props.fetchChannels()
  }

  render() {
    const { channels } = this.props

    return(
      <DashboardLayout title="Channels" current="channels">
        {channels.length > 0 ? (
          <ul>
            {channels.map(channel => <li key={channel.id}>
              <Link to={`/channels/${channel.id}`}>{channel.name}</Link>
            </li>)}
          </ul>
        ) : (
          <p>No channels</p>
        )}
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
