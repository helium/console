import React, { Component } from "react";
import { Typography, Input } from "antd";
const { Text } = Typography;

class QubitroForm extends Component {
  state = {
    webhookKey: "",
    projectId: "",
    appName: "",
  };

  componentDidMount() {
    const { channel } = this.props;

    if (channel) {
      this.setState({
        appName: channel.qubitro_app_name,
        webhookKey: channel.qubitro_webhook_key,
        projectId: channel.qubitro_projectId,
      });
    }
  }

  handleInputUpdate = (e) => {
    this.setState({ [e.target.name]: e.target.value }, () => {
      const { webhookKey, projectId, appName } = this.state;

      this.props.onValidInput({
        qubitro_webhook_key: webhookKey,
        qubitro_projectId: projectId,
        qubitro_app_name: appName,
      }, webhookKey.length > 0 && projectId.length > 0 && appName.length > 0);
    });
  };

  render() {
    return (
      <div>
        <div style={{ marginTop: "20px" }}>
          <Text style={{ display: "block" }}>Webhook Signing Key</Text>
          <Input
            placeholder=""
            name="webhookKey"
            value={this.state.webhookKey}
            onChange={this.handleInputUpdate}
            style={{
              marginBottom: "10px",
              width: "100%",
            }}
          />
          <br />
          <Text style={{ display: "block" }}>Project ID</Text>
          <Input
            placeholder=""
            name="projectId"
            value={this.state.projectId}
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

export default QubitroForm;
