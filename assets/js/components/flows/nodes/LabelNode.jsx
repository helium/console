import React, { Fragment } from 'react';
import { Handle } from 'react-flow-renderer';
import { Typography } from 'antd';
const { Text } = Typography;
import GroupsIcon from '../../../../img/label-node-icon.svg';
import SelectedNodeIcon from './SelectedNodeIcon';

export default ({ data, unconnected, selected }) => {
  return (
    <Fragment>
      {selected && <SelectedNodeIcon />}
      <div style={{
        background: '#2C79EE',
        padding: "10px 15px 10px 15px",
        borderRadius: 5,
        minWidth: 200,
        minHeight: 50,
      }}>
        <div style={{ height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
          <img src={GroupsIcon} style={{ height: 14, marginRight: 8 }} />
          <Text style={{ display: 'block', fontSize: 16, color: '#ffffff', fontWeight: 500 }}>{data.label}</Text>
        </div>
        <Text style={{ display: 'block', fontSize: 12, color: '#ffffff' }}>{data.deviceCount || 0} Devices</Text>
        {!unconnected && (
          <Handle
            type="source"
            position="right"
            style={{ borderRadius: 10, background: '#ffffff', border: '3.5px solid #2C79EE', height: '12px', width: '12px' }}
          />
        )}
      </div>
    </Fragment>
  );
};
