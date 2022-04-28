import React, { Component } from "react";
import { Typography, Input, Button } from 'antd';
const { Text } = Typography
import { post } from "../../../../util/rest";

class UbidotsUpdateForm extends Component {
  state = {
    webhookURL: this.props.channel.endpoint
  };

  handleWebhookUpdate = (e) => {
    this.setState({ webhookURL: e.target.value }, this.validateInput);
  };

  validateInput = () => {
    const webhook_token = this.state.webhookURL.split("/api/web-hook/")[1]
    this.props.onValidInput({ webhook_token }, !!webhook_token && webhook_token.length > 0)
  }

  render() {
    const { mobile } = this.props;
    return (
      <>
        <div>
          <Text style={{ display: "block" }}>Enter Webhook URL:</Text>
        </div>
        <div>
          <Input
            value={this.state.webhookURL}
            onChange={this.handleWebhookUpdate}
            style={{ ...(!mobile && { width: "50%" }) }}
          />
        </div>
      </>
    );
  }
}

export default UbidotsUpdateForm;
