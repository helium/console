import React from 'react';
import { Menu } from 'antd';

export const OrganizationMenu = props => {
  const { orgs, handleClick, ...rest } = props;
  return (
    <Menu {...rest} onClick={handleClick}>
      {orgs.map(org => (
        <Menu.Item key={org.id}>{org.name}</Menu.Item>
      ))}
    </Menu>
  );
};