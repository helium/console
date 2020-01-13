import React, { Component } from 'react';
import { Typography, Input } from 'antd';
const { Text } = Typography

class AzureForm extends Component {
  constructor(props) {
    super(props);

    this.handleInputUpdate = this.handleInputUpdate.bind(this)
    this.state = {
      connectionString: "",
      hostName: "",
      accessKeyName: "",
      accessKey: ""
    }
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value}, () => {
      const { connectionString } = this.state
      if (connectionString.length > 0) {
        // check validation, if pass
        this.props.onValidInput({
          connectionString
        })
      }
    })
  }

  render() {
    const { type } = this.props

    return (
      <div>
        <Text strong>
          Step 2
        </Text>
        <br />
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
          {type === "update" ? "Update your Azure Connection Details" : "Enter your Azure Connection Details"}
        </Text>

        <div>
          <Input
            placeholder="Connection String"
            name="connectionString"
            value={this.state.connectionString}
            onChange={this.handleInputUpdate}
          />
          <p></p>

          <Input
            placeholder="Hostname"
            name="hostName"
            value={this.state.hostName}
            onChange={this.handleInputUpdate}
          />

          <Input
            placeholder="Shared Access Key Name"
            name="accessKeyName"
            value={this.state.accessKeyName}
            onChange={this.handleInputUpdate}
          />

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
