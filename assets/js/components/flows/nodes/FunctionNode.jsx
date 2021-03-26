import React from 'react';
import { Handle } from 'react-flow-renderer';
import { Typography } from 'antd';
const { Text } = Typography
import FunctionIcon from '../../../../img/function-node-icon.svg'

const functionFormats = {
  cayenne: "Cayenne LPP",
  browan_object_locator: "Browan Object Locator",
  custom: "Custom"
}

export default ({ data, unconnected }) => {
  return (
    <div style={{
      background: '#9E59F6',
      padding: '10px 15px 3px 15px',
      borderRadius: 5,
      minWidth: 200,
      minHeight: 50,
    }}>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
        <img src={FunctionIcon} style={{ height: 16 }} />
      </div>
      {!unconnected && (
        <Handle
          type="target"
          position="left"
          style={{ height: '100%', borderRadius: 10, background: '#ffffff', border: '3.5px solid #9E59F6', height: '12px', width: '12px' }}
        />
      )}

      {!unconnected && (
        <Handle
          type="source"
          position="right"
          style={{ height: '100%', borderRadius: 10, background: '#ffffff', border: '3.5px solid #9E59F6', height: '12px', width: '12px' }}
          isValidConnection={connection => connection.target.slice(0,8) !== "function" }
        />
      )}
      <div style={{ height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
        <div>
          <Text style={{ display: 'block', fontSize: 16, color: '#ffffff', fontWeight: 500 }}>{data.label}</Text>
          <Text style={{ fontSize: 10, color: '#ffffff', position: 'relative', top: -5 }}>{functionFormats[data.format]}</Text>
        </div>
      </div>
    </div>
  );
};
