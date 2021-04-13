import React, { Fragment } from 'react';
import { Handle } from 'react-flow-renderer';
import { Typography } from 'antd';
const { Text } = Typography;
import GroupsIcon from '../../../../img/label-node-icon.svg';

export default ({ data }) => {
  const handleStyle = {
    borderRadius: 10,
    background: '#ffffff',
    border: '3.5px solid #2C79EE',
    height: '12px',
    width: '12px'
  };

  const nodeStyle = {
    background: '#2C79EE',
    padding: '10px 15px',
    borderRadius: 5,
    minWidth: 200,
    minHeight: 30,
  };

  return (
    <Fragment>
      <div style={nodeStyle}>
        <Handle type="target" position="left" style={handleStyle} />
        <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
          <img src={GroupsIcon} style={{ height: 14, marginRight: 8 }} />
          <Text style={{ display: 'block', fontSize: 13, color: '#ffffff', fontWeight: 500 }}>{data.label}</Text>
        </div>
        <Handle type="source" position="right" style={handleStyle} />
      </div>
    </Fragment>
  );
};