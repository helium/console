import React, { Component } from 'react'
import { Modal, Button, Typography, Input, Divider, Select, Tabs, Slider, Switch } from 'antd';
import LabelTag, { labelColors } from '../common/LabelTag'
import SquareTag from '../common/SquareTag'
import analyticsLogger from '../../util/analyticsLogger'
import { grayForModalCaptions } from '../../util/colors'
import NotificationSettings from './NotificationSettings';
const { Text } = Typography
const { Option } = Select
const { TabPane } = Tabs

class UpdateLabelModal extends Component {
  state = {
    tab: 'general',
    labelName: null,
    color: this.props.label.color || labelColors[0],
    multiBuyValue: this.props.label.multi_buy || 0,
    adrValue: this.props.label.adr_allowed,
    notificationSettings: this.props.label.label_notification_settings
  }

  handleInputUpdate = (e) => {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleColorSelect = (color) => {
    this.setState({ color })
  }

  handleNotificationSettingsChange = (notificationSettings) => {
    this.setState({ notificationSettings });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { labelName, color, multiBuyValue, notificationSettings, tab, adrValue } = this.state;

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
        this.props.handleUpdateLabelNotificationSettings(notificationSettings);
        analyticsLogger.logEvent("ACTION_UPDATE_LABEL_NOTIFICATION_SETTINGS", { label_notification_settings: notificationSettings });
        this.props.onClose();
        break;
      case 'adr':
        this.props.handleUpdateAdrSetting(adrValue);
        analyticsLogger.logEvent("ACTION_UPDATE_LABEL_ADR_SETTING", { label_adr_setting: adrValue });
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
        adrValue: this.props.label.adr_allowed,
        notificationSettings: this.props.label.label_notification_settings
      }), 200)
    }

    if (prevProps.label.multi_buy !== this.props.label.multi_buy) {
      this.setState({ multiBuyValue: this.props.label.multi_buy })
    }
  }

  render() {
    const { open, onClose, label } = this.props
    const { multiBuyValue, notificationSettings, tab, adrValue } = this.state

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
        width={tab === 'notifications' ? 600 : 520}
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

              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center'}}>
                <Text strong style={{ fontSize: 16, marginRight: 10 }}>Label Color</Text>
                <Select value={this.state.color} name="color" onChange={this.handleColorSelect} className="colorpicker">
                  {
                    labelColors.map((c,i) => (
                      <Option key={i} value={c}><SquareTag color={c} /></Option>
                    ))
                  }
                </Select>
              </div>
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
                    min={0}
                    max={10}
                    tooltipVisible={false}
                    onChange={multiBuyValue => this.setState({ multiBuyValue })}
                  />
                </div>

                <p style={{ color: '#096DD9', fontSize: 18, fontWeight: 600 }}>
                  {
                    !multiBuyValue && "No Additional Packets"
                  }
                  {
                    multiBuyValue == 1 && "1 Additional Packet"
                  }
                  {
                    multiBuyValue > 1 && multiBuyValue < 10 && `${multiBuyValue} Additional Packets`
                  }
                  {
                    multiBuyValue == 10 && `All Additional Packets`
                  }
                </p>
              </div>
              <div style={{ marginTop: 20, paddingLeft: 50, paddingRight: 50 }}>
                <p style={{ color: '#F5222D', fontSize: 16, marginBottom: 0 }}>
                  <span style={{ fontWeight: 600 }}>Warning!</span> Increasing this value could dramatically affect your Data Credit spend.
                </p>
              </div>
              <div style={{ marginTop: 20, paddingLeft: 50, paddingRight: 50 }}>
                <Text strong style={{ fontSize: 16 }}>Note: It only takes a single Label with ADR allowed to apply this setting for devices.</Text>
              </div>
            </div>
          </TabPane>
          <TabPane tab="Notifications" key="notifications">
            <NotificationSettings
              label_id={this.props.label.id}
              notificationSettings={notificationSettings.reduce(
                (obj, item) => (obj[item.key] = { key: item.key, value: item.value, recipients: item.recipients, label_id: this.props.label.id }, obj), {}
              )}
              onChange={this.handleNotificationSettingsChange}
            />
          </TabPane>
          <TabPane tab="ADR (Beta)" key="adr">
            <div style={{ padding: '30px 50px'}}>
              <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <Switch
                  onChange={adrValue => this.setState({ adrValue })}
                  checked={adrValue}
                  style={{ marginRight: 8 }}
                />
                <Text strong style={{ fontSize: 16 }}>Allow ADR (recommended for stationary devices)</Text>
              </div>

              <div style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 14 }}>{
                  "Adaptive Data Rate (ADR) needs to be requested by a device for this setting to have an effect. ADR allows devices to use an optimal data rate which reduces power consumption and airtime on the network based on RF conditions. However, it is recommended to only use this setting for fixed or non-mobile devices to ensure reliable connectivity."
                }</Text>
              </div>

              <Text strong style={{ fontSize: 16 }}>Note: It only takes a single Label with ADR allowed to apply this setting for devices.</Text>
            </div>
          </TabPane>
        </Tabs>
      </Modal>
    )
  }
}

export default UpdateLabelModal
