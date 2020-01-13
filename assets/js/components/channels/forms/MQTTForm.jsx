import React, { Component } from 'react';
import { Typography, Input } from 'antd';
const { Text } = Typography

class MQTTForm extends Component {
  constructor(props) {
    super(props);

    this.handleInputUpdate = this.handleInputUpdate.bind(this)
    this.state = {
      endpoint: "",
      topic: ""
    }
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value}, () => {
      const { endpoint, topic } = this.state
      if (endpoint.length > 0 && topic.length > 0) {
        // check validation, if pass
        this.props.onValidInput({
          endpoint,
          topic
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
          {type === "update" ? "Update your MQTT Connection Details" : "Enter your MQTT Connection Details"}
        </Text>

        <div>
          <Input
            placeholder="Endpoint"
            name="endpoint"
            value={this.state.endpoint}
            onChange={this.handleInputUpdate}
          />

          <Input
            placeholder="Topic"
            name="topic"
            value={this.state.topic}
            onChange={this.handleInputUpdate}
          />
        </div>
      </div>
    );
  }
}

export default MQTTForm;
