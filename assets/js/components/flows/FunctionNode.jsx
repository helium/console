import React from 'react';
import { Handle } from 'react-flow-renderer';
import Logo from '../../../img/function-node-logo.svg'
import { Typography } from 'antd';
const { Text } = Typography
import { TagFilled } from '@ant-design/icons';

const functionFormats = {
  cayenne: "Cayenne LPP",
  browan_object_locator: "Browan Object Locator",
  custom: "Custom"
}

export default ({ data, unconnected }) => {
  return (
    <div style={{
      background: '#1D4676',
      padding: 15,
      borderRadius: 5,
      minWidth: 150,
      minHeight: 50,
    }}>
      {
        !unconnected && (
          <Handle
            type="target"
            position="left"
            style={{ height: '100%', borderRadius: 10, background: '#ffffff', border: '3.5px solid #1D4676', height: '12px', width: '12px' }}
          />
        )
      }
      <div style={{ height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
        <img style={{ width: 40, marginRight: 8 }} src={Logo} />
        <div>
          <Text style={{ display: 'block', fontSize: 16, color: '#ffffff', fontWeight: 500 }}>{data.label}</Text>
          <Text style={{ fontSize: 10, color: '#ffffff' }}>{functionFormats[data.format]}</Text>
        </div>
      </div>
    </div>
  );
};
