import React, { Component, Fragment } from 'react'
import withGql from '../../../graphql/withGql'
import { connect } from 'react-redux'
import { GET_CHANNEL_NAME } from '../../../graphql/channels'
import { Handle } from 'react-flow-renderer';
import { Typography } from 'antd';
const { Text } = Typography;
import ChannelIcon from '../../../../img/channel-node-icon.svg';

class ChannelNode extends Component {
  render() {
    const { loading, error } = this.props.channelNameQuery;

    if (loading || error) return null;

    const { channel } = this.props.channelNameQuery.data;
    return (
      <Fragment>
        <div style={{ background: '#12CB9E' }} className="simple-node">
          <Handle
            className="node-handle"
            type="target"
            position="left"
            style={{ border: '3.5px solid #12CB9E' }}
          />
          <div className="node-content">
          <img src={ChannelIcon} style={{ height: 16, display: 'block', marginRight: 8 }} />
            <Text style={{ display: 'block', fontSize: 13, color: '#ffffff', fontWeight: 500 }}>{channel.name}</Text>
          </div>
        </div>
      </Fragment>
    )
  }
}

function mapStateToProps(state) {
  return {
    socket: state.apollo.socket
  };
}

export default connect(mapStateToProps, null)(
  withGql(ChannelNode, GET_CHANNEL_NAME, props => ({ fetchPolicy: 'cache-first', variables: { id: props.data.label }, name: 'channelNameQuery' }))
)