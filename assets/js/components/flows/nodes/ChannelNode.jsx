import React, { Fragment } from 'react';
import { Handle } from 'react-flow-renderer';
import { Typography } from 'antd';
const { Text } = Typography;
import ChannelIcon from '../../../../img/channel-node-icon.svg';
import AdafruitIcon from '../../../../img/channels/adafruit.png';
import AwsIcon from '../../../../img/channels/aws.png';
import AzureIcon from '../../../../img/channels/azure.png';
import CargoIcon from '../../../../img/channels/cargo.png';
import CayenneIcon from '../../../../img/channels/cayenne.png';
import DatacakeIcon from '../../../../img/channels/datacake.png';
import HttpIcon from '../../../../img/channels/http.png';
import MqttIcon from '../../../../img/channels/mqtt.png';
import TagoIcon from '../../../../img/channels/tago.png';
import UbidotsIcon from '../../../../img/channels/ubidots.png';
import SelectedNodeIcon from './SelectedNodeIcon';

const imgMap = {
  adafruit: AdafruitIcon,
  aws: AwsIcon,
  azure: AzureIcon,
  cargo: CargoIcon,
  cayenne: CayenneIcon,
  datacake: DatacakeIcon,
  http: HttpIcon,
  mqtt: MqttIcon,
  tago: TagoIcon,
  ubidots: UbidotsIcon
}

export default ({ data, fromSidebar, selected }) => {
  return (
    <Fragment>
      {selected && <SelectedNodeIcon />}
      <div style={{
        background: '#12CB9E',
        borderRadius: 5,
        minWidth: 200,
        minHeight: 50,
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        maxHeight: 60,
        minHeight: 60
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
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '10px 15px 6px 15px', alignItems: 'flex-end' }}>
          <img src={ChannelIcon} draggable="false" style={{ height: 16, display: 'block' }} />
          <Text style={{ display: 'block', fontSize: 16, color: '#ffffff', fontWeight: 500 }}>{data.label}</Text>
        </div>
        <div style={{ borderRadius: '0px 5px 5px 0px', overflow: 'hidden' }}>
          <img src={imgMap[data.type]} draggable="false" style={{ height: 60, width: 60 }} />
        </div>
      </div>
    </Fragment>
  )
};
