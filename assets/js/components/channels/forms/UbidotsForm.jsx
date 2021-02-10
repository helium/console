import React, { Component } from 'react';
import { Typography, Input, Button, Select } from 'antd';
import { post } from '../../../util/rest'
const { Text } = Typography
const { Option } = Select

class UbidotsForm extends Component {
  state = {
    authToken: "",
    webhookURL: "",
    loading: false
  }

  handleTokenUpdate = e => {
    this.setState({ authToken: e.target.value })
  }

  getWebhookURL = () => {
    this.setState({ loading: true, webhookURL: "" })

    post('/api/channels/ubidots', {
      "token": this.state.authToken,
      "name": "Helium Integration"
    })
    .then(response => {
      this.setState({ webhookURL: response.data.webhookUrl, loading: false })
    })
    .catch(() => {
      this.setState({ loading: false })
    })
  }

  validateInput = () => {
    const { webhookURL } = this.state
    if (webhookURL.length > 0) {
      this.props.onValidInput({
        method: "post",
        endpoint: webhookURL,
        headers: {},
      })
    }
  }

  render() {
    return(
      <div>
        <div>
          <Text style={{ display: 'block' }}>Enter Auth Token:</Text>
        </div>
        <div>
          <Input
            value={this.state.authToken}
            onChange={this.handleTokenUpdate}
            style={{ width: '50%'}}
          />
          <Button
            disabled={this.state.authToken.length < 1}
            onClick={this.getWebhookURL}
            style={{ marginLeft: 8 }}
          >
            Get Webhook URL
          </Button>
        </div>

        {this.state.loading && <div style={{ marginTop: 12 }}><Text>Loading from Ubidots Server...</Text></div>}
        {this.state.webhookURL && (
          <div style={{ marginTop: 12 }}>
            <Text style={{ display: 'block' }}>Obtained Ubidots Webhook URL!</Text>
            <Text style={{ display: 'block', fontFamily: 'monospace', fontSize: 10 }}>{this.state.webhookURL}</Text>
            <Button
              type="primary"
              onClick={this.validateInput}
              style={{ marginTop: 20 }}
            >
              Continue
            </Button>
          </div>
        )}
      </div>
    );
  }
}

export default UbidotsForm;
