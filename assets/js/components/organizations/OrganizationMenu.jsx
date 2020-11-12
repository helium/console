import React from 'react';
import { Icon, Menu } from 'antd';
import { Link } from 'react-router-dom';

export const OrganizationMenu = props => {
  const { current, orgs, handleClick, ...rest } = props;

  return (
    <Menu {...rest} onClick={handleClick}>
      <Menu.ItemGroup title="Current Organization">
        <Menu.Item key='current'><Link to="/organizations">{current}</Link></Menu.Item>
      </Menu.ItemGroup>
      {orgs.length > 0 && <Menu.Divider /> && 
      <Menu.ItemGroup title="Switch Organization">
        {orgs.map(org => (
          <Menu.Item key={org.id}>{org.name}</Menu.Item>
        ))}
      </Menu.ItemGroup>} 
      <Menu.Divider />
      <Menu.Item key='new'><Icon type="plus" /> New Organization</Menu.Item>
    </Menu>
  );
};