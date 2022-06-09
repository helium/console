import React, { Fragment } from 'react'
import { Handle } from 'react-flow-renderer';
import { Typography } from 'antd';
const { Text } = Typography;
import ChannelIcon from '../../../../img/channel-node-icon.svg';
import Warning from "../../../../img/node-warning.svg";

export default ({ data }) => {
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
          {data.warn && <img src={Warning} style={{ height: 16, marginRight: 5 }} />}
          <img src={ChannelIcon} style={{ height: 16, display: 'block', marginRight: 8 }} />
          <Text style={{ display: 'block', fontSize: 13, color: '#ffffff', fontWeight: 500 }}>{data.label}</Text>
        </div>
      </div>
    </Fragment>
  );
}
