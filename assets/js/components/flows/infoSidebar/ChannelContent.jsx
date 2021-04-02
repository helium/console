import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import withGql from '../../../graphql/withGql'
import { Button, Typography } from 'antd';
const { Text } = Typography;
import moment from 'moment';
import { CHANNEL_SHOW } from '../../../graphql/channels';
import { updateChannel } from '../../../actions/channel'
import analyticsLogger from '../../../util/analyticsLogger'

class ChannelContent extends Component {
  state = {
  }

  componentDidMount() {
    const channelId = this.props.id
    analyticsLogger.logEvent("ACTION_CHANNEL_INFO_SIDEBAR", {"id": channelId})

    const { socket } = this.props

    this.channel = socket.channel("graphql:channel_show", {})
    this.channel.join()
    this.channel.on(`graphql:channel_show:${channelId}:channel_update`, (message) => {
      this.props.channelShowQuery.refetch()
    })

    if (this.props.channelShowQuery.channel) {
      this.setState({ templateBody: this.props.channelShowQuery.channel.payload_template })
    }
  }

  componentWillUnmount() {
    this.channel.leave()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.channelShowQuery.channel != this.props.channelShowQuery.channel) {
      this.setState({ templateBody: this.props.channelShowQuery.channel.payload_template })
    }
  }

  render() {
    const { loading, error, channel } = this.props.channelShowQuery

    if (loading) return null; // TODO add skeleton
    if (error) return (
      <Text>Data failed to load, please reload the page and try again</Text>
    )

    return (
      <React.Fragment>
        <Text style={{ fontSize: 30, fontWeight: 'bold', display: 'block' }}>{channel.name}</Text>
        <Text style={{ fontWeight: 'bold' }}>Last Modified: </Text><Text>{moment.utc(channel.updated_at).local().format('l LT')}</Text>
      </React.Fragment>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    socket: state.apollo.socket,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ updateChannel }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(
  withGql(ChannelContent, CHANNEL_SHOW, props => ({ fetchPolicy: 'cache-first', variables: { id: props.id }, name: 'channelShowQuery' }))
)
