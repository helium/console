import React, { Component } from "react";
import { Typography, Input, Button } from 'antd';
const { Text } = Typography

class MicroshareUpdateForm extends Component {
  state = {
    token: ""
  };

  handleTokenUpdate = (e) => {
    this.setState({ token: e.target.value }, this.validateInput);
  };

  validateInput = () => {
    const { token } = this.state
    this.props.onValidInput({ token }, token.length > 0)
  }

  render() {
    const { mobile } = this.props;
    return (
      <>
        <div>
          <Text style={{ display: "block" }}>Enter Token:</Text>
        </div>
        <div>
          <Input
            value={this.state.token}
            onChange={this.handleTokenUpdate}
            style={{ ...(!mobile && { width: "50%" }) }}
          />
        </div>
      </>
    );
  }
}

export default MicroshareUpdateForm;
