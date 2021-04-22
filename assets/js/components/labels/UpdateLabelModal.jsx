import React, { Component } from 'react'
import { Modal, Button, Typography, Input, Divider, Tabs, Slider, Switch } from 'antd';
import { labelColors } from '../common/LabelTag'
import analyticsLogger from '../../util/analyticsLogger'
import { grayForModalCaptions } from '../../util/colors'
import NotificationSettings from './NotificationSettings';
import WebhookSettings from './WebhookSettings';
const { Text } = Typography
const { TabPane } = Tabs

class UpdateLabelModal extends Component {
  state = {
    tab: 'general',
    labelName: null,
    color: this.props.label.color || labelColors[0],
    multiBuyValue: this.props.label.multi_buy || 1,
    notificationSettings: this.props.label.label_notification_settings,
    notificationWebhooks: this.props.label.label_notification_webhooks,
    subtab: 'email'
  }

  handleInputUpdate = (e) => {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleNotificationSettingsChange = (settings, type) => {
    if (type === 'email') {
      this.setState({ notificationSettings: settings });
    } else if (type === 'webhook') {
      this.setState({ notificationWebhooks: settings });
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { labelName, color, multiBuyValue, notificationSettings, notificationWebhooks, tab, subtab } = this.state;

    switch (tab) {
      case 'general':
        this.props.handleUpdateLabel(labelName, color)
        analyticsLogger.logEvent("ACTION_UPDATE_LABEL",  {id: this.props.label.id, name: labelName, color})
        this.props.onClose();
        break;
      case 'packets':
        this.props.handleUpdateLabelMultiBuy(multiBuyValue)
        analyticsLogger.logEvent("ACTION_UPDATE_LABEL",  {id: this.props.label.id, multi_buy: multiBuyValue })
        this.props.onClose();
        break;
      case 'notifications':
        if (subtab === 'email') {
          this.props.handleUpdateLabelNotificationSettings(notificationSettings);
          analyticsLogger.logEvent("ACTION_UPDATE_LABEL_NOTIFICATION_SETTINGS", { id: this.props.label.id, label_notification_settings: notificationSettings });
        } else {
          this.props.handleUpdateLabelNotificationWebhooks(notificationWebhooks);
          analyticsLogger.logEvent("ACTION_UPDATE_LABEL_NOTIFICATION_WEBHOOKS", { id: this.props.label.id, label_notification_webhooks: notificationWebhooks });
        }
        this.props.onClose();
        break;
    }
  }

  componentDidUpdate = (prevProps) => {
    if (!prevProps.open && this.props.open) {
      setTimeout(() => this.setState({
        labelName: null,
        color: this.props.label.color || labelColors[0],
        multiBuyValue: this.props.label.multi_buy,
        notificationSettings: this.props.label.label_notification_settings,
        notificationWebhooks: this.props.label.label_notification_webhooks
      }), 200)
    }

    if (prevProps.label.multi_buy !== this.props.label.multi_buy) {
      this.setState({ multiBuyValue: this.props.label.multi_buy })
    }
  }

  render() {
    const { open, onClose, label } = this.props
    const { multiBuyValue, notificationSettings, notificationWebhooks, tab } = this.state

    return (
      <Modal
        title="Label Settings"
        visible={open}
        onCancel={onClose}
        centered
        onOk={this.handleSubmit}
        footer={[
          <Button key="back" onClick={onClose}>
            Discard Changes
          </Button>,
          <Button key="submit" type="primary" onClick={this.handleSubmit}>
            Apply Changes
          </Button>
        ]}
        bodyStyle={{ padding: 0 }}
        width={tab === 'notifications' ? 665 : 520}
      >
        <Tabs defaultActiveKey="general" size="large" centered onTabClick={tab => this.setState({ tab })}>
          <TabPane tab="General" key="general">
            <div style={{ padding: '30px 50px'}}>
              <Text strong style={{ fontSize: 16 }}>Label Name</Text>
              <Input
                placeholder={label.name}
                name="labelName"
                value={this.state.labelName}
                onChange={this.handleInputUpdate}
                style={{ marginBottom: 20, marginTop: 4 }}
              />
            </div>
          </TabPane>
          <TabPane tab="Packets" key="packets">
            <div style={{ paddingTop: 20, paddingBottom: 20 }}>
              <div style={{ marginBottom: 12, paddingLeft: 50, paddingRight: 50 }}>
                <Text strong style={{ fontSize: 16 }}>You can purchase duplicate packets if multiple Hotspots hear the device. How many packets do you want to purchase if available?</Text>
              </div>
              <div style={{ backgroundColor: '#F0F2F5', padding: '0px 40px', marginTop: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%', marginBottom: 12, marginTop: 20 }}>
                  <Slider
                    value={this.state.multiBuyValue}
                    min={1}
                    max={10}
                    tooltipVisible={false}
                    onChange={multiBuyValue => this.setState({ multiBuyValue })}
                  />
                </div>

                <p style={{ color: '#096DD9', fontSize: 18, fontWeight: 600 }}>
                  {
                    (!multiBuyValue || multiBuyValue == 1) && "1 Packet"
                  }
                  {
                    multiBuyValue > 1 && multiBuyValue < 10 && `${multiBuyValue} Packets`
                  }
                  {
                    multiBuyValue == 10 && `All Packets`
                  }
                </p>
              </div>
              <div style={{ marginTop: 20, paddingLeft: 50, paddingRight: 50 }}>
                <p style={{ color: '#F5222D', fontSize: 16, marginBottom: 0 }}>
                  <span style={{ fontWeight: 600 }}>Warning!</span> Increasing this value could dramatically affect your Data Credit spend.
                </p>
              </div>
            </div>
          </TabPane>
          <TabPane tab="Notifications" key="notifications">
            <Tabs defaultActiveKey="general" size="large" tabPosition="left"  onTabClick={subtab => this.setState({ subtab })}>
              <TabPane tab="Email" key="email">
                <NotificationSettings
                  label_id={this.props.label.id}
                  notificationSettings={notificationSettings.reduce(
                    (obj, item) => (obj[item.key] = { key: item.key, value: item.value, recipients: item.recipients, label_id: this.props.label.id }, obj), {}
                  )}
                  onChange={this.handleNotificationSettingsChange}
                />
              </TabPane>
              <TabPane tab="Webhooks" key="webhook" style={{ maxHeight: '375px', overflowY: 'scroll' }}>
                <WebhookSettings
                  label_id={this.props.label.id}
                  notificationSettings={notificationWebhooks.reduce(
                    (obj, item) => (obj[item.key] = { key: item.key, value: item.value, url: item.url, notes: item.notes, label_id: this.props.label.id }, obj), {}
                  )}
                  onChange={this.handleNotificationSettingsChange}
                />
              </TabPane>
            </Tabs>
          </TabPane>
        </Tabs>
      </Modal>
    )
  }
}

export default UpdateLabelModal
