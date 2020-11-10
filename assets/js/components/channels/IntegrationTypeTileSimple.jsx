import React from 'react';
import { Typography } from 'antd';
const { Text } = Typography
import { newChannelTypes, premadeChannelTypes } from '../../util/integrationInfo';

export const IntegrationTypeTileSimple = props => {
  const { type } = props;
  const { img, name } = [...newChannelTypes, ...premadeChannelTypes].filter(channel => channel.link.includes(type))[0];

  return (
    <div>
      <img src={img} style={{ "marginRight": "10px", height: "50px", width: "50px"}} />
      <Text strong>
        {name}
      </Text>
    </div>
  );
};