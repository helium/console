import React, { Fragment } from 'react'
import { Handle } from 'react-flow-renderer';
import { Typography } from 'antd';
const { Text } = Typography;
import DeviceIcon from '../../../../img/device-node-icon.svg';

export default ({ data }) => {
  return (
    <Fragment>
      <div style={{ background: '#A6B8CC' }} className="simple-node">
        <div className="node-content">
          <img src={DeviceIcon} style={{ height: 16, marginRight: 8 }} />
          <Text style={{ display: 'block', fontSize: 13, color: '#ffffff', fontWeight: 500 }}>{data.label}</Text>
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