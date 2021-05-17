import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import find from "lodash/find";
import ChannelDashboardLayout from "./ChannelDashboardLayout";
import UserCan from "../common/UserCan";
import { primaryBlue } from "../../util/colors";
import { displayError } from "../../util/messages";
import { CopyToClipboard } from "react-copy-to-clipboard";
import ChannelPayloadTemplate from "./ChannelPayloadTemplate";
import HttpDetails from "./HttpDetails";
import AwsDetails from "./AwsDetails";
import AzureForm from "./forms/AzureForm.jsx";
import AWSForm from "./forms/AWSForm.jsx";
import GoogleForm from "./forms/GoogleForm.jsx";
import MQTTForm from "./forms/MQTTForm.jsx";
import HTTPForm from "./forms/HTTPForm.jsx";
import { updateChannel } from "../../actions/channel";
import { CHANNEL_SHOW } from "../../graphql/channels";
import analyticsLogger from "../../util/analyticsLogger";
import withGql from "../../graphql/withGql";
import {
  Typography,
  Button,
  Input,
  Form,
  Tag,
  Checkbox,
  Card,
  Divider,
  Row,
  Col,
} from "antd";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { isObject } from "lodash";
import MqttDetails from "./MqttDetails";
import { SkeletonLayout } from "../common/SkeletonLayout";
const { Text, Paragraph } = Typography;

class ChannelShow extends Component {
  state = {
    newName: "",
    credentials: {},
    showDownlinkToken: false,
    templateBody: undefined,
    validInput: true,
  };

  componentDidMount() {
    const channelId = this.props.match.params.id;
    analyticsLogger.logEvent("ACTION_NAV_CHANNEL_SHOW", { id: channelId });

    const { socket } = this.props;

    this.channel = socket.channel("graphql:channel_show", {});
    this.channel.join();
    this.channel.on(
      `graphql:channel_show:${channelId}:channel_update`,
      (message) => {
        this.props.channelShowQuery.refetch();
      }
    );
  }

  componentWillUnmount() {
    this.channel.leave();
  }

  componentDidUpdate(prevProps) {
    if (
      !prevProps.channelShowQuery.channel &&
      this.props.channelShowQuery.channel
    ) {
      this.setState({
        templateBody: this.props.channelShowQuery.channel.payload_template,
      });
    }

    if (!this.props.channelShowQuery.loading) {
      const { refetch } = this.props.channelShowQuery;
      refetch();
    }
  }

  handleInputUpdate = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleUpdateDetailsInput = (credentials, validInput = true) => {
    this.setState({ credentials, validInput });
  };

  handleNameChange = () => {
    const { channel } = this.props.channelShowQuery;
    analyticsLogger.logEvent("ACTION_UPDATE_CHANNEL_NAME", {
      id: channel.id,
      name: this.state.newName,
    });
    this.props.updateChannel(channel.id, { name: this.state.newName });
    this.setState({ newName: "" });
  };

  handleChangeDownlinkToken = () => {
    const { channel } = this.props.channelShowQuery;
    analyticsLogger.logEvent("ACTION_UPDATE_CHANNEL_DOWNLINK_TOKEN", {
      id: channel.id,
    });
    this.props.updateChannel(channel.id, { downlink_token: "new" });
  };

  handleUpdateDetailsChange = () => {
    const { channel } = this.props.channelShowQuery;
    const { credentials } = this.state;

    if (Object.keys(credentials).length > 0) {
      analyticsLogger.logEvent("ACTION_UPDATE_CHANNEL_DETAILS", {
        id: channel.id,
      });
      this.props.updateChannel(channel.id, { credentials });
      this.setState({ credentials: {} });
    } else {
      if (channel.type != "aws") {
        displayError(
          "Integration details have not been updated, please update details before submitting"
        );
      } else {
        displayError(
          "Please make sure all form details are filled in properly"
        );
      }
    }
  };

  handleTemplateUpdate = (templateBody) => {
    this.setState({ templateBody });
  };

  updateChannelTemplate = () => {
    const { channel } = this.props.channelShowQuery;
    this.props.updateChannel(channel.id, {
      payload_template: this.state.templateBody,
    });
  };

  renderForm = () => {
    const { channel } = this.props.channelShowQuery;

    switch (channel.type) {
      case "aws":
        return (
          <AWSForm
            onValidInput={this.handleUpdateDetailsInput}
            type="update"
            channel={channel}
          />
        );
      case "google":
        return (
          <GoogleForm
            onValidInput={this.handleUpdateDetailsInput}
            type="update"
            channel={channel}
          />
        );
      case "mqtt":
        return (
          <MQTTForm
            onValidInput={this.handleUpdateDetailsInput}
            type="update"
            channel={channel}
          />
        );
      case "http":
        return (
          <HTTPForm
            onValidInput={this.handleUpdateDetailsInput}
            type="update"
            channel={channel}
          />
        );
      default:
        return (
          <AzureForm
            onValidInput={this.handleUpdateDetailsInput}
            type="update"
            channel={channel}
          />
        );
    }
  };

  render() {
    const { loading, error, channel } = this.props.channelShowQuery;

    if (loading)
      return (
        <ChannelDashboardLayout {...this.props}>
          <div style={{ padding: 40 }}>
            <SkeletonLayout />
          </div>
        </ChannelDashboardLayout>
      );
    if (error)
      return (
        <ChannelDashboardLayout {...this.props}>
          <div style={{ padding: 40 }}>
            <Text>
              Data failed to load, please reload the page and try again
            </Text>
          </div>
        </ChannelDashboardLayout>
      );
    const downlinkKey = channel.downlink_token || `{:downlink_key}`;

    let downlinkUrl = `http://localhost:4000/api/v1/down/${channel.id}/${downlinkKey}/{:optional_device_id}`;

    if (process.env.SELF_HOSTED && window.env_domain !== "localhost:4000") {
      downlinkUrl = `https://${window.env_domain}/api/v1/down/${channel.id}/${downlinkKey}/{:optional_device_id}`;
    }
    if (!process.env.SELF_HOSTED) {
      downlinkUrl = `https://${process.env.ENV_DOMAIN}/api/v1/down/${channel.id}/${downlinkKey}/{:optional_device_id}`;
    }

    const { showDownlinkToken } = this.state;

    return (
      <ChannelDashboardLayout {...this.props}>
        <div
          style={{
            padding: "30px 30px 10px 30px",
            height: "100%",
            width: "100%",
            backgroundColor: "#ffffff",
            borderRadius: 6,
            overflow: "hidden",
            boxShadow: "0px 20px 20px -7px rgba(17, 24, 31, 0.19)",
          }}
        >
          <Card title="Integration Details">
            <UserCan alternate={<Text strong>{channel.name}</Text>}>
              <Input
                name="newName"
                placeholder={channel.name}
                value={this.state.newName}
                onChange={this.handleInputUpdate}
                style={{ width: 300, marginRight: 5 }}
                suffix={`${this.state.newName.length}/50`}
                maxLength={50}
              />
              <Button type="primary" onClick={this.handleNameChange}>
                Update
              </Button>
            </UserCan>
            <Divider />
            <Row>
              <Col span={12}>
                <Paragraph>
                  <Text strong>Type: </Text>
                  <Text>{channel.type_name}</Text>
                </Paragraph>
                <Paragraph>
                  <Text strong>Active:</Text>
                  <Text> {channel.active ? "Yes" : "No"}</Text>
                </Paragraph>
                <Paragraph>
                  <Text strong> ID: </Text>
                  <Text code>{channel.id}</Text>
                </Paragraph>
              </Col>
              <Col span={12}>
                {channel.type === "http" && (
                  <Card size="small" title="HTTP Details">
                    <HttpDetails channel={channel} />
                  </Card>
                )}
                {channel.type === "aws" && (
                  <Card size="small" title="AWS Details">
                    <AwsDetails channel={channel} />
                  </Card>
                )}
                {channel.type === "mqtt" && (
                  <Card size="small" title="MQTT Details">
                    <MqttDetails channel={channel} />
                  </Card>
                )}
              </Col>
            </Row>
            {channel.type === "http" && (
              <UserCan>
                <Divider />
                <Text>Downlink URL</Text>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    marginBottom: 16,
                  }}
                >
                  <Input value={downlinkUrl} style={{ marginRight: 10 }} />
                  <CopyToClipboard text={downlinkUrl}>
                    <Button
                      onClick={() => {}}
                      style={{ marginRight: 0 }}
                      type="primary"
                    >
                      Copy
                    </Button>
                  </CopyToClipboard>
                </div>
                <Text>Downlink Key</Text>
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <Input
                    value={
                      showDownlinkToken
                        ? channel.downlink_token
                        : "************************"
                    }
                    style={{
                      marginRight: 10,
                      color: "#38A2FF",
                      fontFamily: "monospace",
                    }}
                    suffix={
                      showDownlinkToken ? (
                        <EyeOutlined
                          onClick={() =>
                            this.setState({
                              showDownlinkToken: !showDownlinkToken,
                            })
                          }
                        />
                      ) : (
                        <EyeInvisibleOutlined
                          onClick={() =>
                            this.setState({
                              showDownlinkToken: !showDownlinkToken,
                            })
                          }
                        />
                      )
                    }
                  />
                  <CopyToClipboard text={channel.downlink_token}>
                    <Button
                      onClick={() => {}}
                      style={{ marginRight: 10 }}
                      type="primary"
                    >
                      Copy
                    </Button>
                  </CopyToClipboard>
                  <Button
                    onClick={this.handleChangeDownlinkToken}
                    style={{ marginRight: 0 }}
                  >
                    Generate New Key
                  </Button>
                </div>
              </UserCan>
            )}
          </Card>

          <UserCan>
            <Card title="Update your Connection Details">
              {this.renderForm()}
              <Divider />
              <Button
                type="primary"
                onClick={this.handleUpdateDetailsChange}
                disabled={!this.state.validInput}
              >
                Update Details
              </Button>
            </Card>
          </UserCan>

          {((channel.type == "http" &&
            channel.endpoint !==
              "https://lora.mydevices.com/v1/networks/helium/uplink") ||
            channel.type == "mqtt") && (
            <ChannelPayloadTemplate
              templateBody={this.state.templateBody || ""}
              handleTemplateUpdate={this.handleTemplateUpdate}
              updateChannelTemplate={this.updateChannelTemplate}
              channel={channel}
            />
          )}
        </div>
      </ChannelDashboardLayout>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    socket: state.apollo.socket,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ updateChannel }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  withGql(ChannelShow, CHANNEL_SHOW, (props) => ({
    fetchPolicy: "cache-first",
    variables: { id: props.match.params.id },
    name: "channelShowQuery",
  }))
);
