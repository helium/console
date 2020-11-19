import React, { Component } from 'react';
import { Typography, Input, Tooltip, Icon } from 'antd';
const { Text } = Typography
import { Row, Col } from 'antd';


class AdafruitForm extends Component {
  state = {
    username: "",
    adafruitKey: "",
    groupName: ""
  }

  componentDidMount() {
    const { channel } = this.props

    if (channel && channel.credentials.endpoint) {
      this.setState({
        uplinkTopic: channel.credentials.uplink.topic,
        downlinkTopic: channel.credentials.downlink.topic,
      })
    }
  }
  
  handleInputUpdate = (e) => {
    this.setState({ [e.target.name]: e.target.value }, () => {
      const { username, adafruitKey, uplinkTopic, downlinkTopic } = this.state;

      if (username.length > 0) {
        this.props.onValidInput({
          endpoint: `mqtt://${username}:${adafruitKey}@io.adafruit.com:8883`,
          uplink: {
            topic: uplinkTopic || `${username !== '' ? username : '{adafruit username}'}/groups/{{device_id}}/json`
          },
          downlink: {
            topic: downlinkTopic || 'helium/{{device_id}}/tx'
          }
        })
      }
    })
  }
  
  render() {
    const { type } = this.props;

    return (
      <div>
        <Text>
          {`${type === "update" ? "Update" : "Enter"} your Adafruit IO Connection Details`}
        </Text>

        <Row gutter={16} style={{marginBottom: 16, marginTop: 20}}>
        <Col sm={12}>
          <Text>Adafruit Username</Text>
          <Input
            placeholder="Adafruit Username"
            name="username"
            value={this.state.username}
            onChange={this.handleInputUpdate}
          />
        </Col>
        <Col sm={12}>
          <Text>Adafruit IO Key</Text>
          <Input
            placeholder="Adafruit IO Key"
            name="adafruitKey"
            value={this.state.adafruitKey}
            onChange={this.handleInputUpdate}
          />
        </Col>
        </Row>
        <Row gutter={16} style={{marginBottom: 16, marginTop: 20}}>
          <Col sm={12}>
          <Text>Group Name</Text>
          <Input
              placeholder="Group Name"
              name="groupName"
              value={this.state.groupName}
              onChange={this.handleInputUpdate}
            />
            <Text>{"Default: {{device_id}}"}</Text>
          </Col>
        </Row>
        <Row gutter={16} style={{marginBottom: 16, marginTop: 20}}>
          { type === "update" ? (
          <div>
            <Col sm={12} style={{marginBottom: 4, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <Text>Uplink Topic</Text>
              <Tooltip title='Topics should follow MQTT topic rules. Templates can be provided using {{template}} format. Valid template tags are: device_id, device_eui, app_eui, and organization_id.'>
                <Icon type="question-circle" theme="filled" style={{ fontSize: 20, color: 'grey', marginLeft: 5 }}/>
              </Tooltip>
            </Col>
            <Col sm={12} style={{marginBottom: 4, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <Text>Downlink Topic</Text>
              <Tooltip title='Topics should follow MQTT topic rules. Templates can be provided using {{template}} format. Valid template tags are: device_id, device_eui, app_eui, and organization_id.'>
                <Icon type="question-circle" theme="filled" style={{ fontSize: 20, color: 'grey', marginLeft: 5 }}/>
              </Tooltip>
            </Col>
            <Col sm={12}>
              <Input
                placeholder="Uplink topic"
                name="uplinkTopic"
                value={this.state.uplinkTopic}
                onChange={this.handleInputUpdate}
              />
              <Text>{"Default: " + `${this.state.username !== '' ? this.state.username : '{adafruit username}'}/groups/{{device_id}}/json`}</Text>
              <br />
            </Col>
            <Col sm={12}>
              <Input
                placeholder="Downlink topic"
                name="downlinkTopic"
                value={this.state.downlinkTopic}
                onChange={this.handleInputUpdate}
              />
              <br />
              <Text>{"Default: helium/{{device_id}}/tx"}</Text>
            </Col>
          </div>) : null }
        </Row>
      </div>
    );
  }
}

export default AdafruitForm;