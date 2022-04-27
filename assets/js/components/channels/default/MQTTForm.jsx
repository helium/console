import React, { Component } from "react";
import { Typography, Input, Tooltip } from "antd";
import QuestionCircleFilled from "@ant-design/icons/QuestionCircleFilled";
const { Text } = Typography;
import { Row, Col } from "antd";

class MQTTForm extends Component {
  state = {
    endpoint: "",
    uplinkTopic: "",
    downlinkTopic: "",
  };

  componentDidMount() {
    const { channel } = this.props;

    if (channel && channel.credentials.endpoint) {
      this.setState({
        endpoint: channel.credentials.endpoint,
        uplinkTopic: channel.credentials.uplink.topic,
        downlinkTopic: channel.credentials.downlink.topic,
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.channel &&
      prevProps.channel.credentials.endpoint &&
      this.props.channel &&
      this.props.channel.credentials.endpoint &&
      prevProps.channel.credentials.endpoint +
        prevProps.channel.credentials.uplink.topic +
        prevProps.channel.credentials.downlink.topic !=
        this.props.channel.credentials.endpoint +
          this.props.channel.credentials.uplink.topic +
          this.props.channel.credentials.downlink.topic
    ) {
      this.setState({
        endpoint: this.props.channel.credentials.endpoint,
        uplinkTopic: this.props.channel.credentials.uplink.topic,
        downlinkTopic: this.props.channel.credentials.downlink.topic,
      });
    }
  }

  handleInputUpdate = (e) => {
    this.setState({ [e.target.name]: e.target.value }, () => {
      const { endpoint, uplinkTopic, downlinkTopic } = this.state;

      if (endpoint.length > 0) {
        this.props.onValidInput({
          endpoint,
          uplink: {
            topic: uplinkTopic || "helium/{{device_id}}/rx",
          },
          ...(!endpoint.includes("@io.adafruit.com") && {
            downlink: {
              topic: downlinkTopic || "helium/{{device_id}}/tx",
            },
          }),
        });
      }
    });
  };

  render() {
    const { type, mobile } = this.props;

    return (
      <div>
        <Text>
          {type === "update"
            ? "Update your MQTT Connection Details"
            : "Enter your MQTT Connection Details"}
        </Text>

        {!mobile && (
          <>
            <Row gutter={16} style={{ marginBottom: 16, marginTop: 20 }}>
              <Col sm={12}>
                <Text>Endpoint</Text>
                <Input
                  placeholder="mqtt(s)://username:password@mqtt.example.com:1234"
                  name="endpoint"
                  value={this.state.endpoint}
                  onChange={this.handleInputUpdate}
                />
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: 16, marginTop: 20 }}>
              <Col
                sm={12}
                style={{
                  marginBottom: 4,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text>Uplink Topic</Text>
                <Tooltip title="Topics should follow MQTT topic rules. Templates can be provided using {{template}} format. Valid template tags are: device_id, device_name, device_eui, app_eui, and organization_id.">
                  <QuestionCircleFilled
                    style={{ fontSize: 20, color: "grey", marginLeft: 5 }}
                  />
                </Tooltip>
              </Col>
              <Col
                sm={12}
                style={{
                  marginBottom: 4,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text>Downlink Topic</Text>
                <Tooltip title="Topics should follow MQTT topic rules. Templates can be provided using {{template}} format. Valid template tags are: device_id, device_name, device_eui, app_eui, and organization_id.">
                  <QuestionCircleFilled
                    style={{ fontSize: 20, color: "grey", marginLeft: 5 }}
                  />
                </Tooltip>
              </Col>
              <Col sm={12}>
                <Input
                  placeholder="Uplink topic"
                  name="uplinkTopic"
                  value={this.state.uplinkTopic}
                  onChange={this.handleInputUpdate}
                />
                <Text>{"Default: helium/{{device_id}}/rx"}</Text>
                <br />
              </Col>
              <Col sm={12}>
                <Input
                  placeholder="Downlink topic"
                  name="downlinkTopic"
                  value={this.state.downlinkTopic}
                  onChange={this.handleInputUpdate}
                />
                <br />
                <Text>{"Default: helium/{{device_id}}/tx"}</Text>
              </Col>
            </Row>
          </>
        )}
        {mobile && (
          <>
            <Row style={{ margin: "15px 0" }}>
              <Text>Endpoint</Text>
              <Input
                placeholder="mqtt(s)://username:password@mqtt.example.com:1234"
                name="endpoint"
                value={this.state.endpoint}
                onChange={this.handleInputUpdate}
              />
            </Row>
            <Row style={{ margin: "15px 0" }}>
              <Text>Uplink Topic</Text>
              <Tooltip title="Topics should follow MQTT topic rules. Templates can be provided using {{template}} format. Valid template tags are: device_id, device_name, device_eui, app_eui, and organization_id.">
                <QuestionCircleFilled
                  style={{ fontSize: 20, color: "grey", marginLeft: 5 }}
                />
              </Tooltip>
              <Input
                placeholder="Uplink topic"
                name="uplinkTopic"
                value={this.state.uplinkTopic}
                onChange={this.handleInputUpdate}
              />
              <Text>{"Default: helium/{{device_id}}/rx"}</Text>
            </Row>
            <Row style={{ margin: "15px 0" }}>
              <Text>Downlink Topic</Text>
              <Tooltip title="Topics should follow MQTT topic rules. Templates can be provided using {{template}} format. Valid template tags are: device_id, device_name, device_eui, app_eui, and organization_id.">
                <QuestionCircleFilled
                  style={{ fontSize: 20, color: "grey", marginLeft: 5 }}
                />
              </Tooltip>
              <Input
                placeholder="Downlink topic"
                name="downlinkTopic"
                value={this.state.downlinkTopic}
                onChange={this.handleInputUpdate}
              />
              <br />
              <Text>{"Default: helium/{{device_id}}/tx"}</Text>
            </Row>
          </>
        )}
      </div>
    );
  }
}

export default MQTTForm;
