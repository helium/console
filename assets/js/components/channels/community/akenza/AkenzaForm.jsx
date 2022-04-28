import React, { Component } from "react";
import { IntegrationTypeTileSimple } from "../../IntegrationTypeTileSimple";
import { Link } from "react-router-dom";
import ChannelNameForm from "../../default/ChannelNameForm.jsx";
import analyticsLogger from "../../../../util/analyticsLogger";
import { Card, Typography, Input, Button } from 'antd';
const { Text } = Typography

class AkenzaForm extends Component {
  state = {
    secret: "",
    showNextSteps: false,
    validInput: false,
    channelName: "",
  };

  handleSecretUpdate = (e) => {
    this.setState({ secret: e.target.value }, this.validateInput);
  };

  handleNameInput = (e) => {
    this.setState({ channelName: e.target.value });
  };

  validateInput = () => {
    const { secret } = this.state;
    if (secret.length > 0) {
      this.setState({
        showNextSteps: true,
        validInput: true,
      });
    } else {
      this.setState({
        validInput: false
      });
    }
  };

  onSubmit = () => {
    const { secret, channelName } = this.state

    let payload = {
      channel: {
        name: channelName,
        type: this.props.type,
        credentials: {
          secret
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
            <Text style={{ display: "block" }}>Enter Akenza Uplink Secret:</Text>
          </div>
          <div>
            <Input
              value={this.state.secret}
              onChange={this.handleSecretUpdate}
              style={{ ...(!this.props.mobile && { width: "50%" }) }}
            />
          </div>
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

export default AkenzaForm;
