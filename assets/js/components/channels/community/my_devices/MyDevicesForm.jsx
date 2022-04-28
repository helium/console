import React, { Component } from 'react';
import { IntegrationTypeTileSimple } from "../../IntegrationTypeTileSimple";
import { Link } from "react-router-dom";
import ChannelNameForm from "../../default/ChannelNameForm.jsx";
import analyticsLogger from "../../../../util/analyticsLogger";
import { Card, Typography, Button } from 'antd';
const { Text } = Typography

class MyDevicesForm extends Component {
  state = {
    showNextSteps: true,
    validInput: true,
    channelName: "",
  }

  handleNameInput = (e) => {
    this.setState({ channelName: e.target.value });
  };

  onSubmit = () => {
    const { channelName } = this.state

    let payload = {
      channel: {
        name: channelName,
        type: this.props.type,
        credentials: {},
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
    return(
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
            Use a supported device listed on their console or encode the payload with the Cayenne Low Power Payload (Cayenne LPP) format.
          </Text>
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

export default MyDevicesForm;
