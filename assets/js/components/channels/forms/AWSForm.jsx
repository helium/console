import React, { Component } from 'react';
import { Typography, Input } from 'antd';
const { Text } = Typography

class AWSForm extends Component {
  state = {
    accessKeyId: "",
    secretAccessKey: "",
    region: ""
  }

  handleInputUpdate = (e) => {
    this.setState({ [e.target.name]: e.target.value}, () => {
      const {accessKeyId, secretAccessKey, region } = this.state
      if (accessKeyId.length > 0 && secretAccessKey.length > 0 && region.length > 0) {
        // check validation, if pass
        this.props.onValidInput({
          accessKeyId,
          secretAccessKey,
          region
        })
      }
    })
  }

  render() {
    const { type } = this.props

    return (
      <div>
        <Text>
          Connection coming soon...
        </Text>
      </div>
    )

    return(
      <div>
        <Text strong>
          {type === "update" ? "Update Channel" : "Step 2"}
        </Text>
        <br />
        <Text>
          {type === "update" ? "Update your AWS Connection Details" : "Enter your AWS Connection Details"}
        </Text>

        <div>
          <Input
            placeholder="Access Key ID"
            name="accessKeyId"
            value={this.state.accessKeyId}
            onChange={this.handleInputUpdate}
          />

          <Input
            placeholder="Secret Access Key"
            name="secretAccessKey"
            value={this.state.secretAccessKey}
            onChange={this.handleInputUpdate}
          />

          <Input
            placeholder="Region"
            name="region"
            value={this.state.region}
            onChange={this.handleInputUpdate}
          />
        </div>
      </div>
    );
  }
}

export default AWSForm;
