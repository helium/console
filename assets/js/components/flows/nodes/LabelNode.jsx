import React from 'react';
import { Handle } from 'react-flow-renderer';
import { Typography } from 'antd';
const { Text } = Typography
import { TagFilled } from '@ant-design/icons';

export default ({ data }) => {
  return (
    <div style={{
      background: '#2C79EE',
      padding: 15,
      borderRadius: 5,
      minWidth: 150,
      minHeight: 50,
    }}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
        <TagFilled style={{ fontSize: 20, marginRight: 8, color: '#ffffff' }}/>
        <Text style={{ display: 'block', fontSize: 16, color: '#ffffff', fontWeight: 500 }}>{data.label}</Text>
      </div>
        <Handle
          type="source"
          position="right"
          style={{ borderRadius: 10, background: '#ffffff', border: '3.5px solid #2C79EE', height: '12px', width: '12px' }}
        />
    </div>
  );
};
