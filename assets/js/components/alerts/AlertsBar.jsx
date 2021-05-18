import React from 'react';
import NavPointTriangle from '../common/NavPointTriangle';
import { Typography } from 'antd';
const { Text } = Typography;
import { ALERT_TYPES } from './constants';
import { Link } from 'react-router-dom';


const AlertButton = ({ id, name, nodeType, selected }) => (
  <React.Fragment>
    <Link to={`/alerts/${id}`}>
      <div style={{
        position: 'relative',
        background: ALERT_TYPES[nodeType].color,
        marginRight: 10,
        marginRight: '10px',
        width: '140px',
        padding: '5px 10px',height: '50px',
        borderRadius: 25,
        textAlign: 'center',
        lineHeight: '150%'
      }}>
        <div
          style={{
            width: '120px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: 'white',
            textAlign: 'center'
          }}
        >
          <Text style={{ color: 'white', fontSize: 14, fontWeight: 500 }}>{name}</Text>
        </div>
        <Text style={{ color: 'white', fontSize: 12 }}>{ALERT_TYPES[nodeType].name} Alert</Text>
        {
          selected && <NavPointTriangle />
        }
      </div>
    </Link>
  </React.Fragment>
);

export default ({ alerts, shownAlertId }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      {alerts.map(a => (
        <AlertButton key={a.id} id={a.id} name={a.name} nodeType={a.node_type} selected={a.id === shownAlertId} />
      ))}
    </div>
  );
}
