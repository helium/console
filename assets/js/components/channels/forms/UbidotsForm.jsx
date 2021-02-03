import React, { Component } from 'react';
import { Typography, Input, Button, Select } from 'antd';
const { Text } = Typography
const { Option } = Select

class UbidotsForm extends Component {
  state = {
    authToken: "",
  }

  handleTokenUpdate = e => {
    this.setState({ authToken: e.target.value }, this.validateInput)
  }

  validateInput = () => {
    const { authToken } = this.state
    if (authToken.length > 0) {
      this.props.onValidInput({
        method: "post",
        endpoint: "https://industrial.api.ubidots.com/api/v2.0/plugin_types/~helium/plugins/",
        headers: { 'X-Auth-Token': authToken, 'Content-Type': 'application/json' },
      })
    }
  }

  render() {
    return(
      <div>
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
