import React, { Component } from "react";
import { Typography, Input, Row, Col } from "antd";
const { Text } = Typography;

class BlockbaxUpdateForm extends Component {
  state = {
    blockbaxAccessToken: "",
    blockbaxInboundConnectorEndpoint: "",
  };

  handleInputUpdate = (e) => {
    this.setState({ [e.target.name]: e.target.value }, () => {
      const { blockbaxAccessToken, blockbaxInboundConnectorEndpoint } =
        this.state;

      if (
        blockbaxAccessToken.length > 0 &&
        blockbaxInboundConnectorEndpoint.length > 0
      ) {
        this.props.onValidInput(
          {
            blockbaxAccessToken,
            blockbaxInboundConnectorEndpoint,
          },
          true
        );
      } else {
        this.props.onValidInput(
          {
            blockbaxAccessToken: "",
            blockbaxInboundConnectorEndpoint: "",
          },
          false
        );
      }
    });
  };

  render() {
    return (
      <>
        <Text>Enter your Blockbax Integration Details</Text>

        <Row gutter={16} style={{ marginBottom: 16, marginTop: 20 }}>
          <Col sm={12}>
            <Text>Blockbax Access Token</Text>
            <Input
              placeholder="Blockbax Access Token"
              name="blockbaxAccessToken"
              value={this.state.blockbaxAccessToken}
              onChange={this.handleInputUpdate}
            />
          </Col>
          <Col sm={12}>
            <Text>Blockbax Inbound Connector Endpoint</Text>
            <Input
              placeholder="Blockbax Inbound Connector Endpoint"
              name="blockbaxInboundConnectorEndpoint"
              value={this.state.blockbaxInboundConnectorEndpoint}
              onChange={this.handleInputUpdate}
            />
          </Col>
        </Row>
      </>
    );
  }
}

export default BlockbaxUpdateForm;
