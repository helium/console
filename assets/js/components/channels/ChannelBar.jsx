import React from 'react';
import NavPointTriangle from '../common/NavPointTriangle';
import BarIcon from '../../../img/channels/channel-bar-icon.svg'
import Warning from "../../../img/node-warning.svg";
import { integrationImgMap, getAllowedIntegrations } from '../../util/integrationInfo'
import { Typography } from 'antd';
const { Text } = Typography;
import { Link } from 'react-router-dom';

const ChannelButton = ({ id, name, type, selected, warn }) => (
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
            <div>
              {warn && <img src={Warning} style={{ height: 14, marginRight: 5 }} />}
              <img src={BarIcon} style={{ height: 14 }} />
            </div>
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
  const updatedChannels = channels.map(c => Object.assign({}, c, { type: c.type }))
  const allowedIntegrations = getAllowedIntegrations()
  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      {updatedChannels.map(c => (
        <ChannelButton warn={allowedIntegrations && !allowedIntegrations[c.type]} key={c.id} id={c.id} type={c.type} name={c.name} selected={c.id === shownChannelId} />
      ))}
    </div>
  );
}
