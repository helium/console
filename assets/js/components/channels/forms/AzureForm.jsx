import React, { Component } from "react";
import { Typography, Input, Tooltip, Space } from "antd";
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

  validateCredentials() {
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
  }

  handleInputUpdate = (e) => {
    if (!this.props.channel) {
      // ChannelNew
      if (e.target.value === "") {
        this.setState(
          {
            hubName: "",
            policyName: "",
            primaryKey: "",
          },
          () => {
            this.validateCredentials();
          }
        );
      } else {
        const credentials = {};
        e.target.value.split(";").forEach((x) => {
          const [key, value] = x.split("=");
          if (
            ["HostName", "SharedAccessKeyName", "SharedAccessKey"].indexOf(
              key
            ) > -1 &&
            value
          ) {
            credentials[key] = value;
          }
        });

        const parsedHubName =
          credentials["HostName"] &&
          credentials["HostName"].substring(
            0,
            credentials["HostName"].indexOf(".")
          );

        this.setState(
          {
            hubName: parsedHubName ? parsedHubName : "",
            policyName: credentials["SharedAccessKeyName"]
              ? credentials["SharedAccessKeyName"]
              : "",
            primaryKey: credentials["SharedAccessKey"]
              ? credentials["SharedAccessKey"]
              : "",
          },
          () => {
            this.validateCredentials();
          }
        );
      }
    } else {
      // ChannelShow
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
    }
  };

  render() {
    return (
      <Space direction="vertical">
        {!this.props.channel && (
          <div>
            <Text>Primary Connection String</Text>
            <Tooltip
              title={
                "This can be found by clicking Device Explorer on the Azure IoT Hub and then clicking on your device name."
              }
            >
              <QuestionCircleFilled
                style={{ fontSize: 20, color: "grey", marginLeft: 5 }}
              />
            </Tooltip>
            <Input
              placeholder="Connection String"
              onChange={this.handleInputUpdate}
            />
          </div>
        )}
        <div>
          <Text>Hub Name</Text>
          <Input
            name="hubName"
            value={this.state.hubName}
            onChange={this.handleInputUpdate}
            disabled={!this.props.channel}
          />
        </div>
        <div>
          <Text>Policy Name</Text>
          <Tooltip title="In order for this integration to work properly, this policy must have the following permissions enabled on your Azure Hub: Registry Read, Registry Write, and Device Connect.">
            <QuestionCircleFilled
              style={{ fontSize: 20, color: "grey", marginLeft: 5 }}
            />
          </Tooltip>
          <Input
            name="policyName"
            value={this.state.policyName}
            onChange={this.handleInputUpdate}
            disabled={!this.props.channel}
          />
        </div>
        <div>
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
              name="primaryKey"
              value={this.state.primaryKey}
              onChange={this.handleInputUpdate}
              disabled={!this.props.channel}
            />
          ) : (
            <>
              <br />
              <Text code>{Array(this.state.primaryKey.length).join("*")}</Text>
            </>
          )}
        </div>
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
      </Space>
    );
  }
}

export default AzureForm;
