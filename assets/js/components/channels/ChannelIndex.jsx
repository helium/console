import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { fetchChannels, deleteChannel } from '../../actions/channel'
import RandomChannelButton from './RandomChannelButton'
import ChannelsTable from './ChannelsTable'
import DashboardLayout from '../common/DashboardLayout'
import BlankSlate from '../common/BlankSlate'
import userCan from '../../util/abilities'
import ChannelCreateRow from './ChannelCreateRow'

//MUI
import Paper from 'material-ui/Paper';
import Card, { CardActions, CardContent } from 'material-ui/Card';
import Typography from 'material-ui/Typography';

class ChannelIndex extends Component {
  componentDidMount() {
    this.props.fetchChannels()
  }

  render() {
    const { channels, deleteChannel, classes } = this.props

    return(
      <DashboardLayout title="All Channels">
        {userCan('create', 'channel') &&
          <Card>
            <CardContent>
              <Typography variant="headline" component="h3">
                Create New Channel
              </Typography>

              <ChannelCreateRow />
            </CardContent>
          </Card>
        }

        <Paper style={{marginTop: 24}}>
          {channels.length === 0 ? (
            <BlankSlate
              title="No channels"
              subheading="To create a new channel, click the red button in the corner"
            />
          ) : (
            <ChannelsTable channels={channels} deleteChannel={deleteChannel} />
          ) }
        </Paper>

        {userCan('create', 'channel') &&
          <RandomChannelButton />
        }
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
