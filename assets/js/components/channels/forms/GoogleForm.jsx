import React, { Component } from 'react';
import { Typography, Input } from 'antd';
const { Text } = Typography

class GoogleForm extends Component {
  constructor(props) {
    super(props);

    this.handleInputUpdate = this.handleInputUpdate.bind(this)
    this.state = {
      registryId: "",
      region: "",
      privateKey: ""
    }
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value}, () => {
      const { registryId, region, privateKey } = this.state
      if (registryId.length > 0 && region.length > 0 && privateKey.length > 0) {
        // check validation, if pass
        this.props.onValidInput({
          registryId,
          privateKey,
          region
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
          {type === "update" ? "Update your Google Connection Details" : "Enter your Google Connection Details"}
        </Text>

        <div>
          <Input
            placeholder="Registry ID"
            name="registryId"
            value={this.state.registryId}
            onChange={this.handleInputUpdate}
          />

          <Input
            placeholder="Region"
            name="region"
            value={this.state.region}
            onChange={this.handleInputUpdate}
          />

          <Input
            placeholder="JSON Private Key"
            name="privateKey"
            value={this.state.privateKey}
            onChange={this.handleInputUpdate}
          />
        </div>
      </div>
    );
  }
}

export default GoogleForm;
