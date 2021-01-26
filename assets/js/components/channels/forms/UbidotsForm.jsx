import React, { Component } from 'react';
import { Typography, Input, Button, Select } from 'antd';
const { Text } = Typography
const { Option } = Select

class UbidotsForm extends Component {
  state = {
    endpoint: "",
    authToken: "",
  }

  handleSelectEndpoint = endpoint => {
    this.setState({ endpoint }, this.validateInput)
  }

  handleTokenUpdate = e => {
    this.setState({ authToken: e.target.value }, this.validateInput)
  }

  validateInput = () => {
    const { endpoint, authToken } = this.state
    if (endpoint.length > 0 && authToken.length > 0) {
      this.props.onValidInput({
        method: "post",
        endpoint,
        headers: { 'X-Auth-Token': authToken },
      })
    }
  }

  render() {
    return(
      <div>
        <div>
          <Text>Select Endpoint:</Text>
        </div>
        <div style={{ marginBottom: 20 }}>
          <Select
            value={this.state.endpoint}
            onChange={this.handleSelectEndpoint}
            style={{ width: '50%' }}
            size="large"
          >
            <Option value="http://things.ubidots.com">
              http://things.ubidots.com
            </Option>
            <Option value="https://things.ubidots.com">
              https://things.ubidots.com
            </Option>
            <Option value="http://industrial.api.ubidots.com">
              http://industrial.api.ubidots.com
            </Option>
            <Option value="https://industrial.api.ubidots.com">
              https://industrial.api.ubidots.com
            </Option>
          </Select>
        </div>
        <div>
          <Text style={{ display: 'block' }}>Enter Auth Token:</Text>
        </div>
        <Input
          value={this.state.authToken}
          onChange={this.handleTokenUpdate}
          style={{ width: '50%'}}
        />
      </div>
    );
  }
}

export default UbidotsForm;
