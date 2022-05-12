import React, { Component } from "react";
import { Typography, Input, Button } from 'antd';
const { Text } = Typography

class AkenzaUpdateForm extends Component {
  state = {
    secret: ""
  };

  handleSecretUpdate = (e) => {
    this.setState({ secret: e.target.value }, this.validateInput);
  };

  validateInput = () => {
    const { secret } = this.state
    this.props.onValidInput({ secret }, secret.length > 0)
  }

  render() {
    const { mobile } = this.props;
    return (
      <>
        <div>
          <Text style={{ display: "block" }}>Enter Secret:</Text>
        </div>
        <div>
          <Input
            value={this.state.secret}
            onChange={this.handleSecretUpdate}
            style={{ ...(!mobile && { width: "50%" }) }}
          />
        </div>
      </>
    );
  }
}

export default AkenzaUpdateForm;
