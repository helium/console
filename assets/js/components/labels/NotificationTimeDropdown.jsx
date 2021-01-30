import React, { Component } from 'react'
import { Dropdown, Menu } from 'antd';
import { determineTimeValueToShow } from './constants';

class NotificationTimeDropdown extends Component {
  render() {
    const timeMenu = (key) => (
      <Menu onClick={e => { this.props.update({ value: e.key, key}) }}>
        <Menu.Item key="15">15 mins</Menu.Item>
        <Menu.Item key="30">30 mins</Menu.Item>
        <Menu.Item key="60">1 hr</Menu.Item>
        <Menu.Item key="360">6 hrs</Menu.Item>
        <Menu.Item key="540">9 hrs</Menu.Item>
        <Menu.Item key="1440">24 hrs</Menu.Item>
      </Menu>
    );

    return (
      <Dropdown overlay={timeMenu(this.props.setting.key)}>
        <a 
          className="ant-dropdown-link" 
          onClick={e => e.preventDefault()} 
          style={{ textTransform: 'capitalize', textDecoration: 'underline'}}
        >
          {
            determineTimeValueToShow(this.props.value || 60)
          }
        </a>
      </Dropdown>
    );
  }
}

export default NotificationTimeDropdown;