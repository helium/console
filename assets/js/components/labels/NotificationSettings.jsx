import React, { Component } from 'react'
import { Switch, Table, Typography, Row, Col, Dropdown, Menu } from 'antd';
const { Text } = Typography;

const defaultSettings = [
  {
    key: 'device_join_otaa_first_time',
    description: ' when a device activates via OTAA for the first time'
  },
  {
    key: 'device_stops_transmitting',
    description: ' when a device stops transmitting for a defined '
  },
  {
    key: 'device_deleted',
    description: ' when a device has been deleted'
  },
  {
    key: 'integration_stops_working',
    description: ' when an integration with devices stops working '
  },
  {
    key: 'device_first_connects_to_integration',
    description: ' when a device first connects to an integration for the first time'
  },
  {
    key: 'downlink_unsuccessful',
    description: ' when a downlink is unsuccessful'
  },
  {
    key: 'integration_with_devices_deleted',
    description: ' when an integration with devices is deleted'
  },
  {
    key: 'integration_with_devices_updated',
    description: ' when an integration with devices is updated'
  }
];

class NotificationSettings extends Component {
  state = {
    device_join_otaa_first_time: this.props.notificationSettings.filter(s => s.key === 'device_join_otaa_first_time')[0],
    device_stops_transmitting: this.props.notificationSettings.filter(s => s.key === 'device_stops_transmitting')[0],
    device_deleted: this.props.notificationSettings.filter(s => s.key === 'device_deleted')[0],
    integration_stops_working: this.props.notificationSettings.filter(s => s.key === 'integration_stops_working')[0],
    device_first_connects_to_integration: this.props.notificationSettings.filter(s => s.key === 'device_first_connects_to_integration')[0],
    downlink_unsuccessful: this.props.notificationSettings.filter(s => s.key === 'downlink_unsuccessful')[0],
    integration_with_devices_deleted: this.props.notificationSettings.filter(s => s.key === 'integration_with_devices_deleted')[0],
    integration_with_devices_updated: this.props.notificationSettings.filter(s => s.key === 'integration_with_devices_updated')[0],
  }

  updateSetting (setting) {
    this.setState({
      [setting.key]: {
        key: setting.key,
        value: setting && setting.value || this.state[setting.key] && this.state[setting.key].value || "1", //needs to take in either setting coming in or existing
        recipients: setting && setting.recipients || this.state[setting.key] && this.state[setting.key].recipients || 'admin' //needs to take in either setting coming in or existing
      }
    }, () => {
      this.props.onChange([
        this.state.device_join_otaa_first_time,
        this.state.device_stops_transmitting,
        this.state.device_deleted,
        this.state.integration_stops_working,
        this.state.device_first_connects_to_integration,
        this.state.downlink_unsuccessful,
        this.state.integration_with_devices_deleted,
        this.state.integration_with_devices_updated,
      ])
    })
  }

  render() {
    const menu = (key) => (
      <Menu onClick={e => { this.updateSetting({ recipients: e.key, key}) }}>
        <Menu.Item key="admin">Admin</Menu.Item>
        <Menu.Item key="manager">Manager</Menu.Item>
        <Menu.Item key="both">Both</Menu.Item>
      </Menu>
    );

    return (
      defaultSettings.map(setting => (
        <Row style={{ padding: '20px' }} key={setting.key}>
          <Col span={21}>
            <Text>Notify </Text>
            <Dropdown overlay={menu(setting.key)}>
              <a 
                className="ant-dropdown-link" 
                onClick={e => e.preventDefault()} 
                style={{ textTransform: 'capitalize', textDecoration: 'underline'}}
              >
                {
                  (this.state[setting.key] || {}).recipients || 'Admin'
                }
              </a>
            </Dropdown> 
            {setting.description}
          </Col>
          <Col span={3}>
            <Switch 
              onChange={checked => { this.updateSetting({ key: setting.key, value: checked ? "1" : "0" }) }} 
              checked={(this.state[setting.key] || {}).value > 0 ? 
                  true : false} 
            />
          </Col>
        </Row>
      ))
    );
  }
}

export default NotificationSettings