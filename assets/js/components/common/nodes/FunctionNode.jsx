import React, { Fragment } from 'react';
import { Handle } from 'react-flow-renderer';
import { Typography } from 'antd';
const { Text } = Typography;
import FunctionIcon from '../../../../img/function-node-icon.svg';
import Warning from "../../../../img/node-warning.svg";

export default ({ data }) => {
  return (
    <Fragment>
      <div style={{ background: '#9E59F6' }} className="simple-node">
        <div className="node-content">
          {data.warn && <img src={Warning} style={{ height: 16, marginRight: 5 }} />}
          <img src={FunctionIcon} style={{ height: 16, marginRight: 8 }} />
          <Text style={{ display: 'block', fontSize: 13, color: '#ffffff', fontWeight: 500 }}>{data.label}</Text>
        </div>
        <Handle
          type="target"
          position="left"
          className="node-handle"
          style={{ border: '3.5px solid #9E59F6' }}
        />
        <Handle
          type="source"
          position="right"
          className="node-handle"
          style={{ border: '3.5px solid #9E59F6' }}
        />
      </div>
    </Fragment>
  );
}
