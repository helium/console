import React from 'react';
import { Link } from 'react-router-dom';
import { Typography } from 'antd';
const { Text } = Typography;

export const OrganizationName = props => {
  const { name, ...rest } = props;

  return (
    <Link {...rest} to="/organizations">
      <Text style={{ color: "#38A2FF", fontWeight: 500, cursor: 'pointer' }}>{name}</Text>
    </Link>
  );
};