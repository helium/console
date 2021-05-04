import React from 'react';
import NavPointTriangle from '../common/NavPointTriangle';
import BarIcon from '../../../img/channels/channel-bar-icon.svg'
import { Typography } from 'antd';
const { Text } = Typography;
import { Link } from 'react-router-dom';

const ChannelButton = ({ id, name, type, selected }) => (
  <React.Fragment>
    <Link to={`/integrations/${id}`}>
      <div
        style={{
          backgroundColor: '#12CB9E',
          borderRadius: 6,
          padding: '5px 10px 5px 10px',
          cursor: 'pointer',
          height: 50,
          minWidth: 110,
          display: 'flex',
          flexDirection: 'column',
          marginRight: 12,
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', height: '100px' }}>
          <img src={BarIcon} style={{ height: 12, marginRight: 4 }} />
          <Text style={{ color: '#FFFFFF', fontWeight: 500, whiteSpace: 'nowrap' }}>{name}</Text>
        </div>
        <Text style={{ color: '#FFFFFF', fontSize: 10, whiteSpace: 'nowrap' }}>{type}</Text>
        {
          selected && <NavPointTriangle />
        }
      </div>
    </Link>
  </React.Fragment>
);

export default ({ channels, shownChannelId }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      {channels.map(c => (
        <ChannelButton key={c.id} id={c.id} type={c.type} name={c.name} selected={c.id === shownChannelId} />
      ))}
    </div>
  );
}
