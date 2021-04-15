import React, { Fragment } from 'react';
import { Handle } from 'react-flow-renderer';
import { Typography } from 'antd';
const { Text } = Typography;
import ChannelIcon from '../../../../img/channel-node-icon.svg';
import SelectedNodeIcon from './SelectedNodeIcon';

export default ({ data, fromSidebar, selected }) => {
  return (
    <Fragment>
      {selected && <SelectedNodeIcon />}
      <div style={{
        background: '#12CB9E',
        padding: '10px 15px 6px 15px',
        borderRadius: 5,
        minWidth: 200,
        minHeight: 50,
        position: 'relative'
      }}>
        {
          !fromSidebar && (
            <Handle
              type="target"
              position="left"
              style={{ height: '100%', borderRadius: 10, background: '#ffffff', border: '3.5px solid #12CB9E', height: '12px', width: '12px' }}
            />
          )
        }

        {fromSidebar && (
          <div style={{
            height: 12,
            width: 12,
            backgroundColor: 'white',
            borderRadius: 6,
            position: 'absolute',
            top: 'calc(50% - 6px)',
            left: -4.5,
            border: '3.5px solid #12CB9E'
          }} />
        )}
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
          <img src={ChannelIcon} style={{ height: 16, display: 'block' }} />
          <Text style={{ display: 'block', fontSize: 16, color: '#ffffff', fontWeight: 500 }}>{data.label}</Text>
          <Text style={{ fontSize: 10, color: '#ffffff', position: 'relative', top: -5 }}>Integration Type: {data.type}</Text>
        </div>
      </div>
    </Fragment>
  )
};
