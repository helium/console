import React from 'react';
import { Typography, Badge } from 'antd';
const { Text } = Typography

export const IntegrationTypeTile = props => {
  const { tileStyle, iconStyle, img, name, type, count } = props;
  return (
    <div style={tileStyle}>
      <Badge count={count} color="#12CB9F">
        <img style={iconStyle} src={img} />
      </Badge>
      <Text>
        {name}
      </Text>
      {type && <p style={{margin: 0, fontSize: 12, letterSpacing: 0.3, opacity: 0.7}}>{type}</p>}
    </div>
  );
};
