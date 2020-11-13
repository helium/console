import React from 'react';
import { Typography } from 'antd';
const { Text } = Typography

export const IntegrationTypeTile = props => {
  const { tileStyle, iconStyle, img, name, type } = props;
  return (
    <div style={tileStyle}>
      <img style={iconStyle} src={img} />
      <Text>
        {name}
      </Text>
      {type && <p style={{margin: 0, fontSize: 12, letterSpacing: 0.3, opacity: 0.7}}>{type}</p>}
    </div>
  );
};