import React from 'react';
import { Handle } from 'react-flow-renderer';
import { Typography } from 'antd';
const { Text } = Typography
import Azure from '../../../../img/azure-channel.svg'
import Aws from '../../../../img/aws-channel.svg'
import Google from '../../../../img/google-channel.svg'
import Mqtt from '../../../../img/mqtt-channel.svg'
import Http from '../../../../img/http-channel.svg'

const channelIcons = {
  aws: Aws,
  http: Http,
  mqtt: Mqtt
}

export default ({ data, unconnected }) => {
  return (
    <div style={{
      background: '#1D4676',
      padding: 15,
      borderRadius: 5,
      minWidth: 150,
      minHeight: 50,
    }}>
      {
        !unconnected && (
          <Handle
            type="target"
            position="left"
            style={{ height: '100%', borderRadius: 10, background: '#ffffff', border: '3.5px solid #1D4676', height: '12px', width: '12px' }}
          />
        )
      }
      <div style={{ height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
        <img style={{ width: 40, marginRight: 8 }} src={channelIcons[data.type]} draggable={false}/>
        <div>
          <Text style={{ display: 'block', fontSize: 16, color: '#ffffff', fontWeight: 500 }}>{data.label}</Text>
          <Text style={{ fontSize: 10, color: '#ffffff' }}>{data.type_name}</Text>
        </div>
      </div>
    </div>
  );
};
