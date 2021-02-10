import React, { Component } from 'react';
import { Menu } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

@connect(mapStateToProps, null)
class OrganizationMenu extends Component {
  render() {
    const { current, orgs, handleClick, role, dispatch, ...rest } = this.props;
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
        {role === 'admin' && <Menu.Divider />}
        {role === 'admin' && <Menu.Item key='new'><PlusOutlined /> New Organization</Menu.Item>}
      </Menu>
    );
  }
}

function mapStateToProps(state) {
  return {
    role: state.organization.currentRole
  }
}

export default OrganizationMenu
