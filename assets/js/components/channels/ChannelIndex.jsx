import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { fetchChannels, deleteChannel } from '../../actions/channel'
import RandomChannelButton from './RandomChannelButton'
import ChannelsTable from './ChannelsTable'

//MUU
import Paper from 'material-ui/Paper';

class ChannelIndex extends Component {
  componentDidMount() {
    this.props.fetchChannels()
  }

  render() {
    const { channels, deleteChannel } = this.props

    return(
      <DashboardLayout title="Channels" current="channels">
        <h4>Create New Channel</h4>
        <div><Link to={'/channels/new/azure'}>Azure IoT Hub</Link></div>
        <div><Link to={'/channels/new/aws'}>AWS IoT</Link></div>
        <div><Link to={'/channels/new/google'}>Google Cloud IoT Core</Link></div>
        <div><Link to={'/channels/new/mqtt'}>MQTT</Link></div>
        <div><Link to={'/channels/new/http'}>HTTP</Link></div>

        <Paper>
          <ChannelsTable channels={channels} deleteChannel={deleteChannel} />
        </Paper>
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
  return bindActionCreators({ fetchChannels, deleteChannel }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelIndex);
