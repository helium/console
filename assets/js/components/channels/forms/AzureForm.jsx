import React, { Component } from "react";
import { Typography, Input, Tooltip } from "antd";
import QuestionCircleFilled from "@ant-design/icons/QuestionCircleFilled";
const { Text } = Typography;

class AzureForm extends Component {
  state = {
    hubName: "",
    accessKeyName: "",
    accessKey: "",
  };

  componentDidMount() {
    const { channel } = this.props;

    if (channel) {
      this.setState({
        hubName: channel.azure_hub_name,
        accessKeyName: channel.azure_policy_name,
        accessKey: channel.azure_policy_key,
      });
    }
  }

  handleInputUpdate = (e) => {
    this.setState({ [e.target.name]: e.target.value }, () => {
      const { accessKeyName, hubName, accessKey } = this.state;
      const validCredentials =
        accessKeyName.length > 0 && hubName.length > 0 && accessKey.length > 0;
      // check validation, if pass
      this.props.onValidInput(
        {
          azure_policy_name: accessKeyName,
          azure_hub_name: hubName,
          azure_policy_key: accessKey,
        },
        validCredentials
      );
    });
  };

  render() {
    return (
      <div>
        <div>
          <Text>Hub Name</Text>
          <Input
            placeholder="Hub Name"
            name="hubName"
            value={this.state.hubName}
            onChange={this.handleInputUpdate}
          />
          <br />
          <br />
          <Text>Shared Access Key Name</Text>
          <Tooltip title="In order for this integration to work properly, this policy must have the following permissions enabled on your Azure Hub: Registry Read, Registry Write, and Device Connect.">
            <QuestionCircleFilled
              style={{ fontSize: 20, color: "grey", marginLeft: 5 }}
            />
          </Tooltip>
          <Input
            placeholder="Shared Access Key Name"
            name="accessKeyName"
            value={this.state.accessKeyName}
            onChange={this.handleInputUpdate}
          />
          <br />
          <br />
          <Text>Shared Access Key</Text>
          <Input
            placeholder="Shared Access Key"
            name="accessKey"
            value={this.state.accessKey}
            onChange={this.handleInputUpdate}
          />
        </div>
      </div>
    );
  }
}

export default AzureForm;
