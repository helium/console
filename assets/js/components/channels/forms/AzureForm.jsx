import React, { Component } from "react";
import { Typography, Input, Tooltip } from "antd";
import QuestionCircleFilled from "@ant-design/icons/QuestionCircleFilled";
const { Text } = Typography;
import { WarningTwoTone } from "@ant-design/icons";
import EyeOutlined from "@ant-design/icons/EyeOutlined";
import EyeInvisibleOutlined from "@ant-design/icons/EyeInvisibleOutlined";

class AzureForm extends Component {
  state = {
    hubName: "",
    policyName: "",
    primaryKey: "",
    showKey: false,
  };

  componentDidMount() {
    const { channel } = this.props;

    if (channel) {
      this.setState({
        hubName: channel.azure_hub_name,
        policyName: channel.azure_policy_name,
        primaryKey: channel.azure_policy_key,
      });
    }
  }

  handleInputUpdate = (e) => {
    this.setState({ [e.target.name]: e.target.value }, () => {
      const { policyName, hubName, primaryKey } = this.state;
      const validCredentials =
        policyName.length > 0 && hubName.length > 0 && primaryKey.length > 0;
      // check validation, if pass
      this.props.onValidInput(
        {
          azure_policy_name: policyName,
          azure_hub_name: hubName,
          azure_policy_key: primaryKey,
        },
        validCredentials
      );
    });
  };

  render() {
    return (
      <React.Fragment>
        <Text>Hub Name</Text>
        <Tooltip title="For example: {Hub Name}.azure-devices.net">
          <QuestionCircleFilled
            style={{ fontSize: 20, color: "grey", marginLeft: 5 }}
          />
        </Tooltip>
        <Input
          placeholder="Hub Name"
          name="hubName"
          value={this.state.hubName}
          onChange={this.handleInputUpdate}
        />
        <br />
        <br />
        <Text>Policy Name</Text>
        <Tooltip title="In order for this integration to work properly, this policy must have the following permissions enabled on your Azure Hub: Registry Read, Registry Write, and Device Connect.">
          <QuestionCircleFilled
            style={{ fontSize: 20, color: "grey", marginLeft: 5 }}
          />
        </Tooltip>
        <Input
          placeholder="Policy Name"
          name="policyName"
          value={this.state.policyName}
          onChange={this.handleInputUpdate}
        />
        <br />
        <br />
        <Text>Primary Key</Text>
        {this.props.channel && this.state.showKey && (
          <EyeOutlined
            onClick={() => this.setState({ showKey: !this.state.showKey })}
            style={{ marginLeft: 5 }}
          />
        )}{" "}
        {this.props.channel && !this.state.showKey && (
          <EyeInvisibleOutlined
            onClick={() => this.setState({ showKey: !this.state.showKey })}
            style={{ marginLeft: 5 }}
          />
        )}
        {!this.props.channel || (this.props.channel && this.state.showKey) ? (
          <Input
            placeholder="Primary Key"
            name="primaryKey"
            value={this.state.primaryKey}
            onChange={this.handleInputUpdate}
          />
        ) : (
          <>
            <br />
            <Text code>{Array(this.state.primaryKey.length).join("*")}</Text>
          </>
        )}
        <div style={{ marginTop: 20 }}>
          <WarningTwoTone
            twoToneColor="#FFA500"
            style={{ fontSize: 18, paddingRight: 5 }}
          />
          <Text strong>
            To help ensure stable device connectivity, only use Console to
            connect to client IDs.
          </Text>
        </div>
      </React.Fragment>
    );
  }
}

export default AzureForm;
