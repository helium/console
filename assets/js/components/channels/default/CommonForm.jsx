import React, { Component } from 'react';
import { IntegrationTypeTileSimple } from "../IntegrationTypeTileSimple";
import { Link } from "react-router-dom";
import ChannelNameForm from "./ChannelNameForm.jsx";
import AzureHubForm from "./AzureHubForm.jsx";
import AzureCentralForm from "./AzureCentralForm.jsx";
import AWSForm from "./AWSForm.jsx";
import GoogleForm from "./GoogleForm.jsx";
import MQTTForm from "./MQTTForm.jsx";
import HTTPForm from "./HTTPForm.jsx";
import analyticsLogger from "../../../util/analyticsLogger";
import { Card, Typography, Input, Button } from 'antd';
const { Text } = Typography

class CommonForm extends Component {
  state = {
    credentials: null,
    showNextSteps: false,
    validInput: false,
    channelName: "",
  }

  validateInput = (credentials, validInput) => {
    this.setState({ credentials, showNextSteps: true, validInput });
  };

  handleNameInput = (e) => {
    this.setState({ channelName: e.target.value });
  };

  onSubmit = () => {
    const { credentials, channelName } = this.state

    let payload = {
      channel: {
        name: channelName,
        type: this.props.type,
        credentials,
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

  renderForm = (mobile) => {
    switch (this.props.type) {
      case "aws":
        return <AWSForm onValidInput={this.validateInput} mobile={mobile} />
      case "azure":
        return <AzureHubForm onValidInput={this.validateInput} mobile={mobile} />
      case "iot_central":
        return <AzureCentralForm onValidInput={this.validateInput} mobile={mobile} />
      case "mqtt":
        return <MQTTForm onValidInput={this.validateInput} mobile={mobile} />
      // case "google":
        // return <GoogleForm onValidInput={this.validateInput} mobile={mobile} />;
      default:
        return <HTTPForm onValidInput={this.validateInput} mobile={mobile} />
    }
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
                this.props.reset()
              }}
            >
              <Button style={{ marginTop: 15 }}>Change</Button>
            </Link>
          </div>
        </Card>

        <Card title="Step 2 - Endpoint Details">
          {this.renderForm(this.props.mobile)}
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

export default CommonForm;
