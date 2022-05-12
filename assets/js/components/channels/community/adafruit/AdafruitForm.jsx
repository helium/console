import React, { Component } from 'react';
import { IntegrationTypeTileSimple } from "../../IntegrationTypeTileSimple";
import { Link } from "react-router-dom";
import ChannelNameForm from "../../default/ChannelNameForm.jsx";
import AdafruitFunctionSelect from "./AdafruitFunctionSelect.jsx";
import { adafruitTemplate } from "../../../../util/integrationTemplates";
import analyticsLogger from "../../../../util/analyticsLogger";
import { Card, Typography, Input, Button, Tooltip, Popover, Row, Col } from 'antd';
const { Text } = Typography
import QuestionCircleFilled from '@ant-design/icons/QuestionCircleFilled';

class AdafruitForm extends Component {
  state = {
    username: "",
    adafruitKey: "",
    groupName: "{{device_id}}",
    showNextSteps: false,
    validInput: false,
    channelName: "",
    func: { format: "cayenne" },
    templateBody: adafruitTemplate
  }

  handleInputUpdate = (e) => {
    this.setState({ [e.target.name]: e.target.value }, () => {
      const { username, adafruitKey, groupName } = this.state;

      if (username.length > 0 && adafruitKey.length > 0) {
        this.setState({
          showNextSteps: true,
          validInput: true
        })
      } else {
        this.setState({
          validInput: false
        })
      }
    })
  }

  handleNameInput = (e) => {
    this.setState({ channelName: e.target.value });
  };

  handleAdafruitFunctionSelect = (func) => {
    this.setState({
      func,
      templateBody: func.format === "cayenne" ? adafruitTemplate : "",
    });
  };

  onSubmit = () => {
    const { username, adafruitKey, groupName, channelName, templateBody } = this.state

    let payload = {
      channel: {
        name: channelName,
        type: this.props.type,
        credentials: {
          username,
          adafruit_key: adafruitKey,
          group_name: groupName,
        },
        payload_template: templateBody
      },
    };

    this.props.createChannel(payload, this.state.func);

    analyticsLogger.logEvent(
      this.props.mobile ? "ACTION_CREATE_CHANNEL_MOBILE" : "ACTION_CREATE_CHANNEL",
      {
        name: channelName,
        type: this.props.type,
      }
    )
  }

  render() {
    const { type } = this.props;

    return (
      <>
        <Card title="Step 1 – Choose an Integration Type">
          <div>
            <IntegrationTypeTileSimple type={this.props.type} />
            <Link
              to="#"
              onClick={(e) => {
                e.preventDefault();
                this.props.reset()
              }}
            >
              <Button style={{ marginTop: 15 }}>Change</Button>
            </Link>
          </div>
        </Card>

        <Card title="Step 2 - Endpoint Details">
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
        </Card>

        {this.state.showNextSteps && (
          <ChannelNameForm
            channelName={this.state.channelName}
            onInputUpdate={this.handleNameInput}
            validInput={this.state.validInput}
            submit={() => {}}
            mobile={this.props.mobile}
            noSubmit
          />
        )}

        {this.state.showNextSteps && (
          <AdafruitFunctionSelect
            handleFunctionUpdate={this.handleAdafruitFunctionSelect}
          >
            <div style={{ marginTop: 20 }}>
              <Button
                type="primary"
                htmlType="submit"
                onClick={this.onSubmit}
                disabled={!this.state.validInput}
              >
                Add Integration
              </Button>
            </div>
          </AdafruitFunctionSelect>
        )}
      </>
    );
  }
}

export default AdafruitForm;
