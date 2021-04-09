import React from 'react';
import { Handle } from 'react-flow-renderer';
import { Typography } from 'antd';
const { Text } = Typography
import ChannelIcon from '../../../../img/channel-node-icon.svg'
import SelectedNodeIcon from '../../../../img/selected-node.svg';

export default ({ data, unconnected, selected }) => {
  return (
    <React.Fragment>
      {selected && <div style={{ position: 'absolute', right: '50%', top: '-40px' }}><img src={SelectedNodeIcon} style={{ height: 30 }} /></div>}
      <div style={{
        background: '#12CB9E',
        padding: '10px 15px 6px 15px',
        borderRadius: 5,
        minWidth: 200,
        minHeight: 50,
      }}>
        {
          !unconnected && (
            <Handle
              type="target"
              position="left"
              style={{ height: '100%', borderRadius: 10, background: '#ffffff', border: '3.5px solid #12CB9E', height: '12px', width: '12px' }}
            />
          )
        }
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
          <img src={ChannelIcon} style={{ height: 16, display: 'block' }} />
          <Text style={{ display: 'block', fontSize: 16, color: '#ffffff', fontWeight: 500 }}>{data.label}</Text>
          <Text style={{ fontSize: 10, color: '#ffffff', position: 'relative', top: -5 }}>Integration Type: {data.type}</Text>
        </div>
      </div>
    </React.Fragment>
  )
};
