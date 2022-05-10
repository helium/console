import React from 'react';
import { Typography } from 'antd';
const { Text } = Typography
import { CORE_INTEGRATION_TYPES, COMMUNITY_INTEGRATION_TYPES } from '../../util/integrationInfo';

export const IntegrationTypeTileSimple = props => {
  const { type } = props;
  const { img, name, info } = [...CORE_INTEGRATION_TYPES, ...COMMUNITY_INTEGRATION_TYPES].filter(channel => channel.type === type)[0];

  return (
    <div>
      <img src={img} style={{ "marginRight": "10px", height: "50px", width: "50px"}} />
      <Text strong>
        {name}
      </Text>
      <div style={{ paddingTop: '10px', maxWidth: 600 }}>
        <Text style={{ display: 'block' }}>{info.desc}</Text>
        <Text style={{ display: 'block', marginTop: 10 }}><a href={info.docLink} target="_blank">Tell me more about setting up this Integration.</a></Text>
      </div>
    </div>
  );
};
