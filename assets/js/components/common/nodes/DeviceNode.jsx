import React, { Fragment } from 'react';
import { Handle } from 'react-flow-renderer';
import { Typography } from 'antd';
const { Text } = Typography;
import DeviceIcon from '../../../../img/device-node-icon.svg';

export default ({ data }) => {
  return (
    <Fragment>
      <div style={{
        background: '#A6B8CC',
        padding: '10px 15px',
        borderRadius: 5,
        minWidth: 200,
        minHeight: 30,
      }}>
        <div style={{ height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
          <img src={DeviceIcon} style={{ height: 16, marginRight: 8 }} />
          <Text style={{ display: 'block', fontSize: 13, color: '#ffffff', fontWeight: 500 }}>{data.label}</Text>
        </div>
        <Handle
          type="source"
          position="right"
          style={{ borderRadius: 10, background: '#ffffff', border: '3.5px solid #A6B8CC', height: '12px', width: '12px' }}
        />
      </div>
    </Fragment>
  );
};