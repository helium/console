import React, { Component } from 'react';
import { Typography, Input, Tooltip } from 'antd';
const { Text } = Typography
import { Row, Col } from 'antd';


class MQTTForm extends Component {
  state = {
    endpoint: "",
    uplinkTopic: "",
    downlinkTopic: ""
  }

  handleInputUpdate = (e) => {
    this.setState({ [e.target.name]: e.target.value }, () => {
      const { endpoint, uplinkTopic, downlinkTopic } = this.state

      if (endpoint.length > 0) {
        // check validation, if pass
        this.props.onValidInput({
          endpoint,
          uplink: {
            topic: uplinkTopic || 'helium/{device-uuid}/rx'
          },
          downlink: {
            topic: downlinkTopic || 'helium/{device-uuid}/tx'
          }
        })
      }
    })
  }

  render() {
    const { type } = this.props

    return(
      <div>
        <Text>
          {type === "update" ? "Update your MQTT Connection Details" : "Enter your MQTT Connection Details"}
        </Text>

        <Row gutter={16} style={{marginBottom: 16, marginTop: 20}}>

        <Col sm={12}>
          <Text>Endpoint</Text>
          <Input
            placeholder="mqtt(s)://username:password@mqtt.example.com:1234"
            name="endpoint"
            value={this.state.endpoint}
            onChange={this.handleInputUpdate}
          />
        </Col>
        </Row>
        <Row gutter={16} style={{marginBottom: 16, marginTop: 20}}>
          <Col sm={24} style={{marginBottom: 4}}>
          <Text style={{width: 40}}>Topic</Text>
          <Tooltip title='Topics should follow MQTT topic rules. Templates can be provided using {{template}} format. Valid template tags are: device-id, device-eui, app-eui, and organization-id.'>
            <div style={{
              marginLeft: 5,
              backgroundColor: 'grey',
              paddingLeft: 8,
              paddingRight: 8,
              borderRadius: 9999,
              width: 24,
              display: 'inline-block'
            }}>
              <span style={{color: 'white'}}>?</span>
            </div>
          </Tooltip>
          </Col>
          <Col sm={12}>
            <Input
              placeholder="Uplink topic"
              name="uplinkTopic"
              value={this.state.uplinkTopic}
              onChange={this.handleInputUpdate}
            />
            <Text>{"Default: helium/{device-uuid}/rx"}</Text>
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
            <Text>{"Default: helium/{device-uuid}/tx"}</Text>
          </Col>
        </Row>
      </div>
    );
  }
}

export default MQTTForm;
