import React, { Component } from 'react'
import { Switch, Typography, Row, Col, Dropdown, Menu } from 'antd';
const { Text } = Typography;

const NOTIFICATION_SETTINGS_KEYS = {
  DEVICE_JOIN_OTAA_FIRST_TIME: 'device_join_otaa_first_time',
  DEVICE_STOPS_TRANSMITTING: 'device_stops_transmitting',
  DEVICE_DELETED: 'device_deleted',
  INTEGRATION_STOPS_WORKING: 'integration_stops_working',
  DEVICE_FIRST_CONNECTS_TO_INTEGRATION: 'device_first_connects_to_integration',
  DOWNLINK_UNSUCCESSFUL: 'downlink_unsuccessful',
  INTEGRATION_WITH_DEVICES_DELETED: 'integration_with_devices_deleted',
  INTEGRATION_WITH_DEVICES_UPDATED: 'integration_with_devices_updated'
}

const defaultSettings = [
  {
    key: NOTIFICATION_SETTINGS_KEYS.DEVICE_JOIN_OTAA_FIRST_TIME,
    description: ' when a device activates via OTAA for the first time'
  },
  {
    key: NOTIFICATION_SETTINGS_KEYS.DEVICE_STOPS_TRANSMITTING,
    description: ' when a device stops transmitting for '
  },
  {
    key: NOTIFICATION_SETTINGS_KEYS.DEVICE_DELETED,
    description: ' when a device has been deleted'
  },
  {
    key: NOTIFICATION_SETTINGS_KEYS.INTEGRATION_STOPS_WORKING,
    description: ' when an integration with devices stops working'
  },
  {
    key: NOTIFICATION_SETTINGS_KEYS.DEVICE_FIRST_CONNECTS_TO_INTEGRATION,
    description: ' when a device first connects to an integration for the first time'
  },
  {
    key: NOTIFICATION_SETTINGS_KEYS.DOWNLINK_UNSUCCESSFUL,
    description: ' when a downlink is unsuccessful'
  },
  {
    key: NOTIFICATION_SETTINGS_KEYS.INTEGRATION_WITH_DEVICES_DELETED,
    description: ' when an integration with devices is deleted'
  },
  {
    key: NOTIFICATION_SETTINGS_KEYS.INTEGRATION_WITH_DEVICES_UPDATED,
    description: ' when an integration with devices is updated'
  }
];

class NotificationSettings extends Component {
  state = {
    [NOTIFICATION_SETTINGS_KEYS.DEVICE_JOIN_OTAA_FIRST_TIME]: this.props.notificationSettings.filter(s => s.key === NOTIFICATION_SETTINGS_KEYS.DEVICE_JOIN_OTAA_FIRST_TIME)[0],
    [NOTIFICATION_SETTINGS_KEYS.DEVICE_STOPS_TRANSMITTING]: this.props.notificationSettings.filter(s => s.key === NOTIFICATION_SETTINGS_KEYS.DEVICE_STOPS_TRANSMITTING)[0],
    [NOTIFICATION_SETTINGS_KEYS.DEVICE_DELETED]: this.props.notificationSettings.filter(s => s.key === NOTIFICATION_SETTINGS_KEYS.DEVICE_DELETED)[0],
    [NOTIFICATION_SETTINGS_KEYS.INTEGRATION_STOPS_WORKING]: this.props.notificationSettings.filter(s => s.key === NOTIFICATION_SETTINGS_KEYS.INTEGRATION_STOPS_WORKING)[0],
    [NOTIFICATION_SETTINGS_KEYS.DEVICE_FIRST_CONNECTS_TO_INTEGRATION]: this.props.notificationSettings.filter(s => s.key === NOTIFICATION_SETTINGS_KEYS.DEVICE_FIRST_CONNECTS_TO_INTEGRATION)[0],
    [NOTIFICATION_SETTINGS_KEYS.DOWNLINK_UNSUCCESSFUL]: this.props.notificationSettings.filter(s => s.key === NOTIFICATION_SETTINGS_KEYS.DOWNLINK_UNSUCCESSFUL)[0],
    [NOTIFICATION_SETTINGS_KEYS.INTEGRATION_WITH_DEVICES_DELETED]: this.props.notificationSettings.filter(s => s.key === NOTIFICATION_SETTINGS_KEYS.INTEGRATION_WITH_DEVICES_DELETED)[0],
    [NOTIFICATION_SETTINGS_KEYS.INTEGRATION_WITH_DEVICES_UPDATED]: this.props.notificationSettings.filter(s => s.key === NOTIFICATION_SETTINGS_KEYS.INTEGRATION_WITH_DEVICES_UPDATED)[0],
  }

  updateSetting (setting) {
    this.setState({
      [setting.key]: {
        label_id: this.props.label_id,
        key: setting.key,
        value: setting.value || this.state[setting.key] && this.state[setting.key].value || "1", //needs to take in either setting coming in or existing
        recipients: setting.recipients || this.state[setting.key] && this.state[setting.key].recipients || "admin" //needs to take in either setting coming in or existing
      }
    }, () => {
      this.props.onChange([
        ...this.state[NOTIFICATION_SETTINGS_KEYS.DEVICE_JOIN_OTAA_FIRST_TIME] ? [this.state[NOTIFICATION_SETTINGS_KEYS.DEVICE_JOIN_OTAA_FIRST_TIME]] : [],
        ...this.state[NOTIFICATION_SETTINGS_KEYS.DEVICE_STOPS_TRANSMITTING] ? [this.state[NOTIFICATION_SETTINGS_KEYS.DEVICE_STOPS_TRANSMITTING]] : [],
        ...this.state[NOTIFICATION_SETTINGS_KEYS.DEVICE_DELETED] ? [this.state[NOTIFICATION_SETTINGS_KEYS.DEVICE_DELETED]] : [],
        ...this.state[NOTIFICATION_SETTINGS_KEYS.INTEGRATION_STOPS_WORKING] ? [this.state[NOTIFICATION_SETTINGS_KEYS.INTEGRATION_STOPS_WORKING]] : [],
        ...this.state[NOTIFICATION_SETTINGS_KEYS.DEVICE_FIRST_CONNECTS_TO_INTEGRATION] ? [this.state[NOTIFICATION_SETTINGS_KEYS.DEVICE_FIRST_CONNECTS_TO_INTEGRATION]] : [],
        ...this.state[NOTIFICATION_SETTINGS_KEYS.DOWNLINK_UNSUCCESSFUL] ? [this.state[NOTIFICATION_SETTINGS_KEYS.DOWNLINK_UNSUCCESSFUL]] : [],
        ...this.state[NOTIFICATION_SETTINGS_KEYS.INTEGRATION_WITH_DEVICES_DELETED] ? [this.state[NOTIFICATION_SETTINGS_KEYS.INTEGRATION_WITH_DEVICES_DELETED]] : [],
        ...this.state[NOTIFICATION_SETTINGS_KEYS.INTEGRATION_WITH_DEVICES_UPDATED] ? [this.state[NOTIFICATION_SETTINGS_KEYS.INTEGRATION_WITH_DEVICES_UPDATED]] : [],
      ])
    })
  }

  render() {
    const recipientMenu = (key) => (
      <Menu onClick={e => { this.updateSetting({ recipients: e.key, key}) }}>
        <Menu.Item key="admin">Admin</Menu.Item>
        <Menu.Item key="manager">Manager</Menu.Item>
        <Menu.Item key="both">Both</Menu.Item>
      </Menu>
    );

    const timeMenu = (key) => (
      <Menu onClick={e => { this.updateSetting({ value: e.key, key}) }}>
        <Menu.Item key="15">15 mins</Menu.Item>
        <Menu.Item key="30">30 mins</Menu.Item>
        <Menu.Item key="60">1 hr</Menu.Item>
        <Menu.Item key="360">6 hrs</Menu.Item>
        <Menu.Item key="540">9 hrs</Menu.Item>
        <Menu.Item key="1440">24 hrs</Menu.Item>
      </Menu>
    );

    return (
      defaultSettings.map(setting => (
        <Row style={{ padding: '20px' }} key={setting.key}>
          <Col span={20} style={{ fontSize: '16px' }}>
            <Text>Notify </Text>
            <Dropdown overlay={recipientMenu(setting.key)}>
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
            {setting.key === NOTIFICATION_SETTINGS_KEYS.DEVICE_STOPS_TRANSMITTING &&
            <Dropdown overlay={timeMenu(setting.key)}>
              <a 
                className="ant-dropdown-link" 
                onClick={e => e.preventDefault()} 
                style={{ textTransform: 'capitalize', textDecoration: 'underline'}}
              >
                {
                  (this.state[setting.key] || {}).value || '1 hr'
                }
              </a>
            </Dropdown>
            }
          </Col>
          <Col span={4} style={{ paddingLeft: 15 }}>
            <Switch 
              onChange={checked => { this.updateSetting({ key: setting.key, value: checked ? "1" : "0" }) }} 
              checked={(this.state[setting.key] || {}).value > 0 ? true : false} 
            />
          </Col>
        </Row>
      ))
    );
  }
}

export default NotificationSettings;