import React, { Component } from "react";
import { Typography, Input, Button, Row, Col, Popover } from 'antd';
const { Text } = Typography
import QuestionCircleFilled from '@ant-design/icons/QuestionCircleFilled';

class AdafruitUpdateForm extends Component {
  state = {
    username: "",
    adafruitKey: "",
    groupName: "{{device_id}}",
  };

  handleInputUpdate = (e) => {
    this.setState({ [e.target.name]: e.target.value }, () => {
      const { username, adafruitKey, groupName } = this.state;

      if (username.length > 0 && adafruitKey.length > 0) {
        this.props.onValidInput({
          username,
          adafruit_key: adafruitKey,
          group_name: groupName,
        }, true)
      } else {
        this.props.onValidInput({
          username: "",
          adafruit_key: "",
          group_name: "",
        }, false)
      }
    })
  }

  render() {
    return (
      <>
        <Text>
          {`Enter your Adafruit IO Connection Details`}
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
          <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Text>Group Name</Text>
            <Popover
                content={
                  <Text>
                    {`By default, {{device_id}} will be used and is guaranteed to be unique. If you'd like to choose a human-readable group name, you may enter {{device_name}} or make sure that what you enter will be unique; otherwise Adafruit IO might encounter errors.`}
                  </Text>
                }
                placement="top"
                overlayStyle={{ width: 250 }}
              >
                <QuestionCircleFilled style={{ fontSize: 20, color: 'grey', marginLeft: 8 }}/>
              </Popover>
          </div>
          <Input
              placeholder="Group Name"
              name="groupName"
              value={this.state.groupName}
              onChange={this.handleInputUpdate}
            />
            <Text>{"Default: {{device_id}}"}</Text>
          </Col>
        </Row>
      </>
    );
  }
}

export default AdafruitUpdateForm;
