import React, { Fragment } from 'react';
import { Handle } from 'react-flow-renderer';
import { Typography } from 'antd';
const { Text } = Typography;
import FunctionIcon from '../../../../img/function-node-icon.svg';

export default ({ data }) => {
  const nodeStyle = {
    background: '#9E59F6',
    padding: '10px 15px',
    borderRadius: 5,
    minWidth: 200,
    minHeight: 30,
  };

  return (
    <Fragment>
      <div style={nodeStyle}>
        <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
          <img src={FunctionIcon} style={{ height: 16, marginRight: 8 }} />
          <Text style={{ display: 'block', fontSize: 13, color: '#ffffff', fontWeight: 500 }}>{data.label}</Text>
        </div>
        <Handle
          type="target"
          position="left"
          style={{ height: '100%', borderRadius: 10, background: '#ffffff', border: '3.5px solid #9E59F6', height: '12px', width: '12px' }}
        />
        <Handle
          type="source"
          position="right"
          style={{ height: '100%', borderRadius: 10, background: '#ffffff', border: '3.5px solid #9E59F6', height: '12px', width: '12px' }}
        />
      </div>
    </Fragment>
  );
};
