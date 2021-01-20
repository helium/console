import React from 'react';
import { Handle } from 'react-flow-renderer';
import { Typography } from 'antd';
const { Text } = Typography
import { TagFilled } from '@ant-design/icons';

export default ({ data, unconnected }) => {
  return (
    <div style={{
      background: '#FFD666',
      padding: 15,
      borderRadius: 5,
      minWidth: 150,
      minHeight: 50,
    }}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
        <TagFilled style={{ fontSize: 20, marginRight: 8 }}/>
        <Text strong style={{ fontSize: 16 }}>{data.label}</Text>
      </div>
      {
        !unconnected && (
          <Handle
            type="source"
            position="right"
            style={{ borderRadius: 10, background: '#ffffff', border: '3.5px solid #FFD666', height: '12px', width: '12px' }}
          />
        )
      }
    </div>
  );
};
