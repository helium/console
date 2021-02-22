import React, { Component } from 'react';
import { Typography, Input, Button, Select } from 'antd';
import { post } from '../../../util/rest'
const { Text } = Typography
const { Option } = Select

class TagoForm extends Component {
  state = {
    token: ""
  }

  handleTokenUpdate = e => {
    this.setState({ token: e.target.value }, this.validateInput)
  }

  validateInput = () => {
    const { token } = this.state
    if (token.length > 0) {
      this.props.onValidInput({
        method: "post",
        endpoint: 'https://helium.middleware.tago.io/uplink',
        headers: {
          "Authorization": token
        },
      })
    }
  }

  render() {
    return(
      <div>
        <div>
          <Text style={{ display: 'block' }}>Enter TagoIO Authorization Token:</Text>
        </div>
        <div>
          <Input
            value={this.state.token}
            onChange={this.handleTokenUpdate}
            style={{ width: '50%'}}
          />
        </div>
      </div>
    );
  }
}

export default TagoForm;
