import React, { Component } from "react";
import { IntegrationTypeTileSimple } from "../../IntegrationTypeTileSimple";
import { Link } from "react-router-dom";
import ChannelNameForm from "../../default/ChannelNameForm.jsx";
import analyticsLogger from "../../../../util/analyticsLogger";
import { Card, Typography, Input, Button, Row, Col } from "antd";
const { Text } = Typography;

class BlockbaxForm extends Component {
  state = {
    showNextSteps: false,
    blockbaxAccessToken: "",
    blockbaxInboundConnectorEndpoint: "",
    validInput: true,
    channelName: "",
  };

  handleInputUpdate = (e) => {
    this.setState({ [e.target.name]: e.target.value }, () => {
      const { blockbaxAccessToken, blockbaxInboundConnectorEndpoint } =
        this.state;

      if (
        blockbaxAccessToken.length > 0 &&
        blockbaxInboundConnectorEndpoint.length > 0
      ) {
        this.setState({
          showNextSteps: true,
          validInput: true,
        });
      } else {
        this.setState({
          validInput: false,
        });
      }
    });
  };

  handleNameInput = (e) => {
    this.setState({ channelName: e.target.value });
  };

  onSubmit = () => {
    const {
      blockbaxAccessToken,
      blockbaxInboundConnectorEndpoint,
      channelName,
    } = this.state;

    const payload = {
      channel: {
        name: channelName,
        type: this.props.type,
        blockbaxInboundConnectorEndpoint,
        credentials: {
          blockbaxAccessToken,
        },
      },
    };

    this.props.createChannel(payload);

    const topic = this.props.mobile
      ? "ACTION_CREATE_CHANNEL_MOBILE"
      : "ACTION_CREATE_CHANNEL";

    analyticsLogger.logEvent(topic, {
      name: channelName,
      type: this.props.type,
    });
  };

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
                this.props.reset();
              }}
            >
              <Button style={{ marginTop: 15 }}>Change</Button>
            </Link>
          </div>
        </Card>

        <Card title="Step 2 - Blockbax Endpoint Details">
          <Text>
            {`${type === "update" ? "Update" : "Enter"} your Blockbax details`}
          </Text>

          <Row gutter={16} style={{ marginBottom: 16, marginTop: 20 }}>
            <Col sm={12}>
              <Text>Blockbax Access Token</Text>
              <Input
                placeholder="Blockbax Access Token"
                name="blockbaxAccessToken"
                value={this.state.blockbaxAccessToken}
                onChange={this.handleInputUpdate}
              />
            </Col>
            <Col sm={12}>
              <Text>Blockbax Inbdound Connector Endpoint</Text>
              <Input
                placeholder="Blockbax Inbound Connector Endpoint"
                name="blockbaxInboundConnectorEndpoint"
                value={this.state.blockbaxInboundConnectorEndpoint}
                onChange={this.handleInputUpdate}
              />
            </Col>
          </Row>
        </Card>

        {this.state.showNextSteps && (
          <ChannelNameForm
            channelName={this.state.channelName}
            onInputUpdate={this.handleNameInput}
            validInput={this.state.validInput}
            submit={this.onSubmit}
            mobile={this.props.mobile}
          />
        )}
      </>
    );
  }
}

export default BlockbaxForm;
