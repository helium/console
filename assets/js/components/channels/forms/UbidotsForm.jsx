import React, { Component } from "react";
import { IntegrationTypeTileSimple } from "../IntegrationTypeTileSimple";
import { getRootType } from "../../../util/integrationInfo";
import { Link } from "react-router-dom";
import ChannelNameForm from "./ChannelNameForm.jsx";
import analyticsLogger from "../../../util/analyticsLogger";
import { Card, Typography, Input, Button } from 'antd';
const { Text } = Typography
import { post } from "../../../util/rest";

class UbidotsForm extends Component {
  state = {
    method: "post",
    headers: {},
    webhookURL: "",
    authToken: "",
    loading: false,
    showNextSteps: false,
    validInput: false,
    channelName: "",
  };

  handleTokenUpdate = (e) => {
    this.setState({ authToken: e.target.value });
  };

  handleNameInput = (e) => {
    this.setState({ channelName: e.target.value });
  };

  validateInput = () => {
    this.setState({ showNextSteps: true, validInput: true })
  }

  getWebhookURL = () => {
    this.setState({ loading: true, webhookURL: "", showNextSteps: false, validInput: false });

    post("/api/channels/ubidots", {
      token: this.state.authToken,
      name: "Helium Integration",
    })
      .then((response) => {
        this.setState({ webhookURL: response.data.webhookUrl, loading: false });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  };

  onSubmit = () => {
    const { method, webhookURL, headers, channelName } = this.state

    let payload = {
      channel: {
        name: channelName,
        type: getRootType(this.props.type),
        credentials: {
          method: method,
          endpoint: webhookURL,
          headers: headers
        },
      },
    };

    this.props.createChannel(payload);

    analyticsLogger.logEvent(
      this.props.mobile ? "ACTION_CREATE_CHANNEL_MOBILE" : "ACTION_CREATE_CHANNEL",
      {
        name: channelName,
        type: this.props.type,
      }
    )
  }

  render() {
    const { mobile } = this.props;
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
          <div>
            <Text style={{ display: "block" }}>Enter Auth Token:</Text>
          </div>
          <div>
            <Input
              value={this.state.authToken}
              onChange={this.handleTokenUpdate}
              style={{ ...(!mobile && { width: "50%" }) }}
            />
            {mobile && <br />}
            <Button
              disabled={this.state.authToken.length < 1}
              onClick={this.getWebhookURL}
              style={{ ...(mobile ? { marginTop: 8 } : { marginLeft: 10 }) }}
            >
              Get Webhook URL
            </Button>
          </div>

          {this.state.loading && (
            <div style={{ marginTop: 12 }}>
              <Text>Loading from Ubidots Server...</Text>
            </div>
          )}
          {this.state.webhookURL && (
            <div style={{ marginTop: 12 }}>
              <Text style={{ display: "block" }}>
                Obtained Ubidots Webhook URL!
              </Text>
              <Text
                style={{
                  display: "block",
                  fontFamily: "monospace",
                  fontSize: 10,
                }}
              >
                {this.state.webhookURL}
              </Text>
              <Button
                onClick={this.validateInput}
                style={{ marginTop: 20 }}
              >
                Continue
              </Button>
            </div>
          )}
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

export default UbidotsForm;
