import React, { Component } from "react";
import { Typography, Input, Row, Col } from 'antd';
const { Text } = Typography

class BlockbaxUpdateForm extends Component {
  state = {
    blockbaxAccessToken: "",
    blockbaxInbdoundConnectorEndpoint: "",
  };

  handleInputUpdate = (e) => {
    this.setState({ [e.target.name]: e.target.value }, () => {
      const { blockbaxAccessToken, blockbaxInbdoundConnectorEndpoint } = this.state;

      if (blockbaxAccessToken.length > 0 && blockbaxInbdoundConnectorEndpoint.length > 0) {
        this.props.onValidInput({
          blockbaxAccessToken: blockbaxAccessToken,
          blockbaxInbdoundConnectorEndpoint: blockbaxInbdoundConnectorEndpoint
        }, true)
      } else {
        this.props.onValidInput({
          accessToken: "",
          inboundConnectorEndpoint: "",
        }, false)
      }
    })
  }

  render() {
    return (
      <>
        <Text>
          {`Enter your Adafruit IO Connection Details`}
        </Text>

        <Row gutter={16} style={{marginBottom: 16, marginTop: 20}}>
        <Col sm={12}>
          <Text>Adafruit Username</Text>
          <Input
            placeholder="Blockbax Access Token"
            name="blockbaxAccessToken"
            value={this.state.blockbaxAccessToken}
            onChange={this.handleInputUpdate}
          />
        </Col>
        <Col sm={12}>
          <Text>Adafruit IO Key</Text>
          <Input
            placeholder="Blockbax Inbound Connector Endpoint"
            name="blockbaxInbdoundConnectorEndpoint"
            value={this.state.blockbaxInbdoundConnectorEndpoint}
            onChange={this.handleInputUpdate}
          />
        </Col>
        </Row>
      </>
    );
  }
}

export default BlockbaxUpdateForm;
