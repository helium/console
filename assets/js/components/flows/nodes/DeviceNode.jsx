import React, { Fragment } from 'react';
import { Handle } from 'react-flow-renderer';
import { Typography } from 'antd';
const { Text } = Typography;
import DeviceIcon from '../../../../img/device-node-icon.svg';
import SelectedNodeIcon from './SelectedNodeIcon';

export default ({ data, unconnected, selected }) => {
  return (
    <Fragment>
      {selected && <SelectedNodeIcon />}
      <div style={{
        background: '#A6B8CC',
        padding: 15,
        borderRadius: 5,
        minWidth: 200,
        minHeight: 50,
      }}>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
          <img src={DeviceIcon} style={{ height: 16 }} />
        </div>
        <div style={{ height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
          <Text style={{ display: 'block', fontSize: 16, color: '#ffffff', fontWeight: 500 }}>{data.label}</Text>
        </div>
        {!unconnected && (
          <Handle
            type="source"
            position="right"
            style={{ borderRadius: 10, background: '#ffffff', border: '3.5px solid #A6B8CC', height: '12px', width: '12px' }}
          />
        )}
      </div>
    </Fragment>
  );
};
