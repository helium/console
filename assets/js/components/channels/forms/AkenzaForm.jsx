import React, { Component } from "react";
import { Typography, Input } from "antd";
const { Text } = Typography;

class AkenzaForm extends Component {
  state = {
    token: "",
  };

  handleTokenUpdate = (e) => {
    this.setState({ token: e.target.value }, this.validateInput);
  };

  validateInput = () => {
    const { token } = this.state;
    if (token.length > 0) {
      this.props.onValidInput({
        method: "post",
        endpoint: `https://data-gateway.akenza.io/v3/capture?secret=${token}`,
      });
    }
  };

  render() {
    return (
      <div>
        <div>
          <Text style={{ display: "block" }}>
            Enter Akenza Authorization Token:
          </Text>
        </div>
        <div>
          <Input
            value={this.state.token}
            onChange={this.handleTokenUpdate}
            style={{ width: "50%" }}
          />
        </div>
      </div>
    );
  }
}

export default AkenzaForm;
