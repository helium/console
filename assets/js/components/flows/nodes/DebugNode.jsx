import React from 'react';
import { Handle } from 'react-flow-renderer';
import Logo from '../../../../img/debug-node-logo.svg'
import { Typography } from 'antd';
const { Text } = Typography

export default ({ data, fromSidebar }) => {
  return (
    <div style={{
      background: '#1D4676',
      padding: 15,
      borderRadius: 5,
      minWidth: 200,
      minHeight: 50,
      position: 'relative'
    }}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
        <img style={{ width: 40, marginRight: 8 }} src={Logo} />
        <Text style={{ display: 'block', fontSize: 16, color: '#ffffff', fontWeight: 500 }}>Debug</Text>
      </div>
      {!fromSidebar && (
        <Handle
          type="target"
          position="left"
          style={{ borderRadius: 10, background: '#ffffff', border: '3.5px solid #1D4676', height: '12px', width: '12px' }}
        />
      )}

      {fromSidebar && (
        <div style={{
          height: 12,
          width: 12,
          backgroundColor: 'white',
          borderRadius: 6,
          position: 'absolute',
          top: 'calc(50% - 6px)',
          left: -4.5,
          border: '3.5px solid #1D4676'
        }} />
      )}
    </div>
  );
};
