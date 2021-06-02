import React, { Component } from "react";
import { Typography, Input } from "antd";
const { Text } = Typography;

class MicroshareForm extends Component {
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
        endpoint: `https://ingest.paks.microshare.io/share/io.microshare.helium.packed/token/${token}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  };

  render() {
    return (
      <div>
        <div>
          <Text style={{ display: "block" }}>Enter Token:</Text>
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

export default MicroshareForm;
