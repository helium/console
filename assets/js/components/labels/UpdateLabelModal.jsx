import React, { Component } from 'react'
import { Modal, Button, Typography, Input, Divider, Select, Tabs, Slider } from 'antd';
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
    notificationSettings: this.props.label.label_notification_settings || []
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
    const { labelName, color, multiBuyValue, notificationSettings, tab } = this.state;

    switch (tab) {
      case 'general':
        this.props.handleUpdateLabel(labelName, color)
        analyticsLogger.logEvent("ACTION_UPDATE_LABEL",  {id: this.props.label.id, name: labelName, color})
        this.props.onClose()
      case 'packets':
        this.props.handleUpdateLabelMultiBuy(multiBuyValue)
        analyticsLogger.logEvent("ACTION_UPDATE_LABEL",  {id: this.props.label.id, multi_buy: multiBuyValue })
        this.props.onClose()
      case 'notifications':
        this.props.handleUpdateLabelNotificationSettings(notificationSettings);
        analyticsLogger.logEvent("ACTION_UPDATE_LABEL_NOTIFICATION_SETTINGS", { label_notification_settings: notificationSettings })
        this.props.onClose()
    }
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.open && !this.props.open) {
      setTimeout(() => this.setState({
        labelName: null,
        color: this.props.label.color || labelColors[0],
        multiBuyValue: this.props.label.multi_buy,
        notificationSettings: this.props.label.label_notification_settings // not resetting them upon closing/opening :/
      }), 200)
    }

    if (prevProps.label.multi_buy !== this.props.label.multi_buy) {
      this.setState({ multiBuyValue: this.props.label.multi_buy })
    }
  }

  render() {
    const { open, onClose, label } = this.props
    const { multiBuyValue, notificationSettings } = this.state

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
      >
        <Tabs defaultActiveKey="general" size="large" onTabClick={tab => this.setState({ tab })}>
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
              <div style={{ textAlign: 'center', marginBottom: 12, paddingLeft: 50, paddingRight: 50 }}>
                <Text strong style={{ fontSize: 16 }}>You can purchase duplicate packets if multiple Hotspots hear the device.</Text>
              </div>
              <div style={{ textAlign: 'center', paddingLeft: 50, paddingRight: 50 }}>
                <Text style={{ fontSize: 16 }}>How many additional redundant packets do you want to purchase if available?</Text>
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
              <div style={{ textAlign: 'center', marginTop: 20, paddingLeft: 50, paddingRight: 50 }}>
                <p style={{ color: '#F5222D', fontSize: 16, marginBottom: 0 }}>
                  <span style={{ fontWeight: 600 }}>Warning!</span> Increasing this value could dramatically affect your Data Credit spend.
                </p>
              </div>
            </div>
          </TabPane>
          <TabPane tab="Notifications" key="notifications">
            <NotificationSettings 
              notificationSettings={notificationSettings}
              onChange={this.handleNotificationSettingsChange}
            />
          </TabPane>
        </Tabs>
      </Modal>
    )
  }
}

export default UpdateLabelModal
