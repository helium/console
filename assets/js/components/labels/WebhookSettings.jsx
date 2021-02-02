import React, { Component } from 'react'
import { Switch, Typography, Row, Col, Input } from 'antd';
const { Text } = Typography;
import { NOTIFICATION_SETTINGS_KEYS, DEFAULT_SETTINGS, determineValue } from './constants';
import NotificationTimeDropdown from './NotificationTimeDropdown';

class WebhookSettings extends Component {
  state = {
    [NOTIFICATION_SETTINGS_KEYS.DEVICE_JOIN_OTAA_FIRST_TIME]: this.props.notificationSettings[NOTIFICATION_SETTINGS_KEYS.DEVICE_JOIN_OTAA_FIRST_TIME],
    [NOTIFICATION_SETTINGS_KEYS.DEVICE_STOPS_TRANSMITTING]: this.props.notificationSettings[NOTIFICATION_SETTINGS_KEYS.DEVICE_STOPS_TRANSMITTING],
    [NOTIFICATION_SETTINGS_KEYS.DEVICE_DELETED]: this.props.notificationSettings[NOTIFICATION_SETTINGS_KEYS.DEVICE_DELETED],
    [NOTIFICATION_SETTINGS_KEYS.INTEGRATION_STOPS_WORKING]: this.props.notificationSettings[NOTIFICATION_SETTINGS_KEYS.INTEGRATION_STOPS_WORKING],
    [NOTIFICATION_SETTINGS_KEYS.INTEGRATION_RECEIVES_FIRST_EVENT]: this.props.notificationSettings[NOTIFICATION_SETTINGS_KEYS.INTEGRATION_RECEIVES_FIRST_EVENT],
    [NOTIFICATION_SETTINGS_KEYS.DOWNLINK_UNSUCCESSFUL]: this.props.notificationSettings[NOTIFICATION_SETTINGS_KEYS.DOWNLINK_UNSUCCESSFUL],
    [NOTIFICATION_SETTINGS_KEYS.INTEGRATION_WITH_DEVICES_DELETED]: this.props.notificationSettings[NOTIFICATION_SETTINGS_KEYS.INTEGRATION_WITH_DEVICES_DELETED],
    [NOTIFICATION_SETTINGS_KEYS.INTEGRATION_WITH_DEVICES_UPDATED]: this.props.notificationSettings[NOTIFICATION_SETTINGS_KEYS.INTEGRATION_WITH_DEVICES_UPDATED],
  }

  componentDidUpdate (prevProps) {
    if (this.props.notificationSettings !== prevProps.notificationSettings) {
      this.setState({
        [NOTIFICATION_SETTINGS_KEYS.DEVICE_JOIN_OTAA_FIRST_TIME]: this.props.notificationSettings[NOTIFICATION_SETTINGS_KEYS.DEVICE_JOIN_OTAA_FIRST_TIME],
        [NOTIFICATION_SETTINGS_KEYS.DEVICE_STOPS_TRANSMITTING]: this.props.notificationSettings[NOTIFICATION_SETTINGS_KEYS.DEVICE_STOPS_TRANSMITTING],
        [NOTIFICATION_SETTINGS_KEYS.DEVICE_DELETED]: this.props.notificationSettings[NOTIFICATION_SETTINGS_KEYS.DEVICE_DELETED],
        [NOTIFICATION_SETTINGS_KEYS.INTEGRATION_STOPS_WORKING]: this.props.notificationSettings[NOTIFICATION_SETTINGS_KEYS.INTEGRATION_STOPS_WORKING],
        [NOTIFICATION_SETTINGS_KEYS.INTEGRATION_RECEIVES_FIRST_EVENT]: this.props.notificationSettings[NOTIFICATION_SETTINGS_KEYS.INTEGRATION_RECEIVES_FIRST_EVENT],
        [NOTIFICATION_SETTINGS_KEYS.DOWNLINK_UNSUCCESSFUL]: this.props.notificationSettings[NOTIFICATION_SETTINGS_KEYS.DOWNLINK_UNSUCCESSFUL],
        [NOTIFICATION_SETTINGS_KEYS.INTEGRATION_WITH_DEVICES_DELETED]: this.props.notificationSettings[NOTIFICATION_SETTINGS_KEYS.INTEGRATION_WITH_DEVICES_DELETED],
        [NOTIFICATION_SETTINGS_KEYS.INTEGRATION_WITH_DEVICES_UPDATED]: this.props.notificationSettings[NOTIFICATION_SETTINGS_KEYS.INTEGRATION_WITH_DEVICES_UPDATED]
      });
    }
  }

  updateSetting (setting) {
    this.setState({
      [setting.key]: {
        label_id: this.props.label_id,
        key: setting.key,
        value: determineValue(setting, this.state[setting.key] && this.state[setting.key].value),
        url: typeof setting.url === 'undefined' && this.state[setting.key] ? this.state[setting.key].url : setting.url,
        notes: typeof setting.notes === 'undefined' && this.state[setting.key] ? this.state[setting.key].notes : setting.notes
      }
    }, () => {
      this.props.onChange([
        ...this.state[NOTIFICATION_SETTINGS_KEYS.DEVICE_JOIN_OTAA_FIRST_TIME] ? [this.state[NOTIFICATION_SETTINGS_KEYS.DEVICE_JOIN_OTAA_FIRST_TIME]] : [],
        ...this.state[NOTIFICATION_SETTINGS_KEYS.DEVICE_STOPS_TRANSMITTING] ? [this.state[NOTIFICATION_SETTINGS_KEYS.DEVICE_STOPS_TRANSMITTING]] : [],
        ...this.state[NOTIFICATION_SETTINGS_KEYS.DEVICE_DELETED] ? [this.state[NOTIFICATION_SETTINGS_KEYS.DEVICE_DELETED]] : [],
        ...this.state[NOTIFICATION_SETTINGS_KEYS.INTEGRATION_STOPS_WORKING] ? [this.state[NOTIFICATION_SETTINGS_KEYS.INTEGRATION_STOPS_WORKING]] : [],
        ...this.state[NOTIFICATION_SETTINGS_KEYS.INTEGRATION_RECEIVES_FIRST_EVENT] ? [this.state[NOTIFICATION_SETTINGS_KEYS.INTEGRATION_RECEIVES_FIRST_EVENT]] : [],
        ...this.state[NOTIFICATION_SETTINGS_KEYS.DOWNLINK_UNSUCCESSFUL] ? [this.state[NOTIFICATION_SETTINGS_KEYS.DOWNLINK_UNSUCCESSFUL]] : [],
        ...this.state[NOTIFICATION_SETTINGS_KEYS.INTEGRATION_WITH_DEVICES_DELETED] ? [this.state[NOTIFICATION_SETTINGS_KEYS.INTEGRATION_WITH_DEVICES_DELETED]] : [],
        ...this.state[NOTIFICATION_SETTINGS_KEYS.INTEGRATION_WITH_DEVICES_UPDATED] ? [this.state[NOTIFICATION_SETTINGS_KEYS.INTEGRATION_WITH_DEVICES_UPDATED]] : [],
      ], 'webhook')
    })
  }

  render() {
    return (
      DEFAULT_SETTINGS.map(setting => (
        <div key={setting.key}>
          <Row style={{ padding: '10px 20px 10px 20px' }} key={setting.key}>
            <Col span={21} style={{ fontSize: '16px'  }}>
              <Text>Notify when </Text>
              <Text><b>{setting.description}</b></Text>
              {setting.key === NOTIFICATION_SETTINGS_KEYS.DEVICE_STOPS_TRANSMITTING &&
                <NotificationTimeDropdown 
                  setting={setting} 
                  update={s => { this.updateSetting(s)} } value={this.state[setting.key] && this.state[setting.key].value} 
                />
              }
            </Col>
            <Col span={3} style={{ paddingLeft: 15 }}>
              <Switch 
                onChange={checked => { this.updateSetting({ key: setting.key, value: checked ? (setting.key === NOTIFICATION_SETTINGS_KEYS.DEVICE_STOPS_TRANSMITTING ? "60" : "1") : "0" }) }} 
                checked={(this.state[setting.key] || {}).value > 0 ? true : false} 
              />
            </Col>
          </Row>
          {
            (this.state[setting.key] || {}).value > 0 && 
            <div style={{ paddingLeft: '30px' }}>
              <Input
                placeholder="Web Hook URL"
                name="url"
                value={this.state[setting.key].url}
                onChange={e => { this.updateSetting({ key: setting.key, url: e.target.value })}}
                addonBefore="URL"
                style={{ width: '445px', marginBottom: '10px' }}
              />
              <Input
                placeholder="Notes"
                name="notes"
                value={this.state[setting.key].notes}
                onChange={e => { this.updateSetting({ key: setting.key, notes: e.target.value })}}
                addonBefore="Notes"
                style={{ width: '445px', marginBottom: '10px' }}
              />
              </div>
          }
        </div>
      ))
    );
  }
}

export default WebhookSettings;