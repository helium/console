import React, { Component } from "react";
import { Typography, Input } from "antd";
const { Text } = Typography;

class AkenzaForm extends Component {
  state = {
    secret: "",
  };

  handleSecretUpdate = (e) => {
    this.setState({ secret: e.target.value }, this.validateInput);
  };

  validateInput = () => {
    const { secret } = this.state;
    if (secret.length > 0) {
      this.props.onValidInput({
        method: "post",
        endpoint: `https://data-gateway.akenza.io/v3/capture?secret=${secret}`,
      });
    }
  };

  render() {
    return (
      <div>
        <div>
          <Text style={{ display: "block" }}>Enter Akenza Uplink Secret:</Text>
        </div>
        <div>
          <Input
            value={this.state.secret}
            onChange={this.handleSecretUpdate}
            style={{ width: "50%" }}
          />
        </div>
      </div>
    );
  }
}

export default AkenzaForm;
