import React, { Component } from "react";
import { Typography, Input } from "antd";
const { Text } = Typography;

class AzureCentralForm extends Component {
  state = {
    apiKey: "",
    scopeId: "",
    appName: "",
  };

  componentDidMount() {
    const { channel } = this.props;

    if (channel) {
      console.log({ channel });
      this.setState({
        appName: channel.iot_central_app_name,
        scopeId: channel.iot_central_scope_id,
        apiKey: channel.iot_central_api_key,
      });
    }
  }

  handleInputUpdate = (e) => {
    this.setState({ [e.target.name]: e.target.value }, () => {
      const { apiKey, scopeId, appName } = this.state;
      if (apiKey.length > 0 && scopeId.length > 0 && appName.length > 0) {
        // check validation, if pass
        this.props.onValidInput({
          iot_central_api_key: apiKey,
          iot_central_scope_id: scopeId,
          iot_central_app_name: appName,
        });
      }
    });
  };

  render() {
    return (
      <div>
        <div style={{ marginTop: "20px" }}>
          <Text style={{ display: "block" }}>API Key</Text>
          <Input
            placeholder=""
            name="apiKey"
            value={this.state.apiKey}
            onChange={this.handleInputUpdate}
            style={{
              marginBottom: "10px",
              width: "100%",
            }}
          />
          <br />
          <Text style={{ display: "block" }}>Scope ID</Text>
          <Input
            placeholder=""
            name="scopeId"
            value={this.state.scopeId}
            onChange={this.handleInputUpdate}
            style={{
              marginBottom: "10px",
              width: this.props.mobile ? "100%" : "350px",
            }}
          />
          <br />
          <Text style={{ display: "block" }}>App Name</Text>
          <Input
            placeholder=""
            name="appName"
            value={this.state.appName}
            onChange={this.handleInputUpdate}
            style={{
              marginBottom: "10px",
              width: this.props.mobile ? "100%" : "350px",
            }}
          />
          <br />
        </div>
      </div>
    );
  }
}

export default AzureCentralForm;
