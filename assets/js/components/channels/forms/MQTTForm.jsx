import React, { Component } from 'react';
import { Typography, Input } from 'antd';
const { Text } = Typography
import { Row, Col } from 'antd';


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

    return(
      <div>
          <Text>
          {type === "update" ? "Update your MQTT Connection Details" : "Enter your MQTT Connection Details"}
        </Text>

        <Row gutter={16} style={{marginBottom: 16, marginTop: 20}}>
        <Col sm={12}>
          <Input
            placeholder="Endpoint"
            name="endpoint"
            value={this.state.endpoint}
            onChange={this.handleInputUpdate}
          />
          </Col>
          <Col sm={12}>
          <Input
            placeholder="Topic"
            name="topic"
            value={this.state.topic}
            onChange={this.handleInputUpdate}
          />
          </Col>
          </Row>
      </div>
    );
  }
}

export default MQTTForm;
