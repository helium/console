import React, { Fragment } from 'react'
import { Handle } from 'react-flow-renderer';
import { Typography } from 'antd';
const { Text } = Typography;
import GroupsIcon from '../../../../img/label-node-icon.svg';

export default ({ data }) => {
  return (
    <Fragment>
      <div style={{ background: '#2C79EE' }} className="simple-node">
        <Handle type="target" position="left" className="node-handle" style={{ border: '3.5px solid #2C79EE' }} />
        <div className="node-content">
          <img src={GroupsIcon} style={{ height: 14, marginRight: 8 }} />
          <Text style={{ display: 'block', fontSize: 13, color: '#ffffff', fontWeight: 500 }}>{data.label}</Text>
        </div>
        <Handle type="source" position="right" className="node-handle" style={{ border: '3.5px solid #2C79EE' }} />
      </div>
    </Fragment>
  );
}