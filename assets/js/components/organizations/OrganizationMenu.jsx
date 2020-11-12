import React from 'react';
import { Icon, Menu } from 'antd';

export const OrganizationMenu = props => {
  const { current, orgs, handleClick, ...rest } = props;

  return (
    <Menu {...rest} onClick={handleClick}>
      <Menu.ItemGroup title="Current Organization">
        <Menu.Item disabled style={{ color: "#1b1f23"}}>{current}</Menu.Item>
      </Menu.ItemGroup>
      <Menu.Divider />
      <Menu.ItemGroup title="Switch Organization">
        {orgs.map(org => (
          <Menu.Item key={org.id}>{org.name}</Menu.Item>
        ))}
      </Menu.ItemGroup>
      <Menu.Divider />
      <Menu.Item key={'new'}><Icon type="plus" /> New Organization</Menu.Item>
    </Menu>
  );
};