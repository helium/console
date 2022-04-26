import React from 'react';
import NavPointTriangle from '../common/NavPointTriangle';
import BarIcon from '../../../img/channels/channel-bar-icon.svg'
import { getIntegrationTypeForFlows, integrationImgMap } from '../../util/integrationInfo'
import { Typography } from 'antd';
const { Text } = Typography;
import { Link } from 'react-router-dom';

const ChannelButton = ({ id, name, type, selected }) => (
  <React.Fragment>
    <Link to={`/integrations/${id}`}>
      <div
        style={{
          backgroundColor: selected ? '#0CA47F' : '#12CB9E',
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
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', paddingLeft: 10, position: 'relative', top: 3 }}>
            <img src={BarIcon} style={{ height: 14, display: 'block' }} />
            <Text style={{ color: '#FFFFFF', fontWeight: 500, whiteSpace: 'nowrap' }}>{name}</Text>
          </div>
          <img src={integrationImgMap[type]} draggable="false" style={{ height: 50, width: 50, marginLeft: 8, borderRadius: '0px 6px 6px 0px' }} />
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
