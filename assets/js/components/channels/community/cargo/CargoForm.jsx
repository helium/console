import React, { Component } from 'react';
import { IntegrationTypeTileSimple } from "../../IntegrationTypeTileSimple";
import { getRootType } from "../../../../util/integrationInfo";
import { Link } from "react-router-dom";
import ChannelNameForm from "../../default/ChannelNameForm.jsx";
import analyticsLogger from "../../../../util/analyticsLogger";
import { Card, Typography, Button } from 'antd';
const { Text } = Typography

class CargoForm extends Component {
  state = {
    method: "post",
    endpoint: "https://cargo.helium.com/api/payloads",
    headers: { "Content-Type": "application/json" },
    showNextSteps: false,
    validInput: false,
    channelName: "",
  }

  validateInput = () => {
    this.setState({ showNextSteps: true, validInput: true })
  }

  handleNameInput = (e) => {
    this.setState({ channelName: e.target.value });
  };

  onSubmit = () => {
    const { method, endpoint, headers, channelName } = this.state

    let payload = {
      channel: {
        name: channelName,
        type: getRootType(this.props.type),
        credentials: {
          method: method,
          endpoint: endpoint,
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
            You are opting to test your devices on the Helium Cargo HTTP integration endpoint.
          </Text>
          <br />
          <Text>
            Helium Cargo is an evaluation tool and the data collected is available to all developers.
          </Text>
          <br />
          <Text>
            Please do not share any sensitive information. Use at your own discretion.
          </Text>
          <br />
          <Button
            onClick={this.validateInput}
            type="default"
            style={{marginTop: 20}}
          >
            I AGREE
          </Button>
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

export default CargoForm;
