import React from 'react';
import NavPointTriangle from '../common/NavPointTriangle';
import BarIcon from '../../../img/channels/channel-bar-icon.svg'
import { getIntegrationTypeForFlows } from '../../util/flows'
import { Typography } from 'antd';
const { Text } = Typography;
import { Link } from 'react-router-dom';
import AdafruitIcon from '../../../img/channels/adafruit.png';
import AwsIcon from '../../../img/channels/aws.png';
import AzureIcon from '../../../img/channels/azure.png';
import CargoIcon from '../../../img/channels/cargo.png';
import CayenneIcon from '../../../img/channels/cayenne.png';
import DatacakeIcon from '../../../img/channels/datacake.png';
import HttpIcon from '../../../img/channels/http.png';
import MqttIcon from '../../../img/channels/mqtt.png';
import TagoIcon from '../../../img/channels/tago.png';
import UbidotsIcon from '../../../img/channels/ubidots.png';
import GoogleSheetIcon from '../../../img/google-channel.svg'

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
  ubidots: UbidotsIcon,
  googlesheets: GoogleSheetIcon
}

const ChannelButton = ({ id, name, type, selected }) => (
  <React.Fragment>
    <Link to={`/integrations/${id}`}>
      <div
        style={{
          backgroundColor: '#12CB9E',
          borderRadius: 6,
          cursor: 'pointer',
          height: 50,
          minHeight: 50,
          maxHeight: 50,
          minWidth: 140,
          marginRight: 12,
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', paddingLeft: 10 }}>
              <img src={BarIcon} style={{ height: 12, marginRight: 4 }} />
              <Text style={{ color: '#FFFFFF', fontWeight: 500, whiteSpace: 'nowrap' }}>{name}</Text>
            </div>
            <Text style={{ color: '#FFFFFF', fontSize: 10, whiteSpace: 'nowrap', paddingLeft: 10 }}>{type}</Text>
          </span>
          <img src={imgMap[type]} draggable="false" style={{ height: 50, width: 50, marginLeft: 16, borderRadius: '0px 6px 6px 0px' }} />
        </div>
        {
          selected && <NavPointTriangle />
        }
      </div>
    </Link>
  </React.Fragment>
);

export default ({ channels, shownChannelId }) => {
  const updatedChannels = channels.map(c => Object.assign({}, c, { type: getIntegrationTypeForFlows(c.endpoint, c.type) }))

  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      {updatedChannels.map(c => (
        <ChannelButton key={c.id} id={c.id} type={c.type} name={c.name} selected={c.id === shownChannelId} />
      ))}
    </div>
  );
}
