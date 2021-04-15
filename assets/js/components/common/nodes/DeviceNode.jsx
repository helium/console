import React, { Component, Fragment } from 'react'
import withGql from '../../../graphql/withGql'
import { connect } from 'react-redux'
import { GET_DEVICE_NAME } from '../../../graphql/devices'
import { Handle } from 'react-flow-renderer';
import { Typography } from 'antd';
const { Text } = Typography;
import DeviceIcon from '../../../../img/device-node-icon.svg';

class DeviceNode extends Component {
  render() {
    const { loading, error } = this.props.deviceNameQuery;

    if (loading || error) return null;

    const { device } = this.props.deviceNameQuery.data;

    return (
      <Fragment>
        <div style={{ background: '#A6B8CC' }} className="simple-node">
          <div className="node-content">
            <img src={DeviceIcon} style={{ height: 16, marginRight: 8 }} />
            <Text style={{ display: 'block', fontSize: 13, color: '#ffffff', fontWeight: 500 }}>{device.name}</Text>
          </div>
          <Handle
            type="source"
            position="right"
            className="node-handle"
            style={{ border: '3.5px solid #A6B8CC' }}
          />
        </div>
      </Fragment>
    );
  }
}

function mapStateToProps(state) {
  return {
    socket: state.apollo.socket
  };
}

export default connect(mapStateToProps, null)(
  withGql(DeviceNode, GET_DEVICE_NAME, props => ({ fetchPolicy: 'cache-first', variables: { id: props.data.label }, name: 'deviceNameQuery' }))
)
