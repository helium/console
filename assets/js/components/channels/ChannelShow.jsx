import React, { Component } from "react";
import { connect } from "react-redux";
import includes from 'lodash/includes'
import { bindActionCreators } from "redux";
import ChannelDashboardLayout from "./ChannelDashboardLayout";
import ChannelConnectionDetails from "./ChannelConnectionDetails";
import UserCan, { userCan } from "../common/UserCan";
import { MobileDisplay, DesktopDisplay } from "../mobile/MediaQuery";
import { displayError } from "../../util/messages";
import { minWidth, isMobile } from "../../util/constants";
import { CopyToClipboard } from "react-copy-to-clipboard";
import ChannelPayloadTemplate from "./ChannelPayloadTemplate";
import HttpDetails from "./HttpDetails";
import AwsDetails from "./AwsDetails";
import { updateChannel } from "../../actions/channel";
import { CHANNEL_SHOW } from "../../graphql/channels";
import analyticsLogger from "../../util/analyticsLogger";
import withGql from "../../graphql/withGql";
import {
  Typography,
  Button,
  Input,
  Card,
  Divider,
  Row,
  Col,
  Switch,
} from "antd";
import EyeOutlined from "@ant-design/icons/EyeOutlined";
import EyeInvisibleOutlined from "@ant-design/icons/EyeInvisibleOutlined";
import MqttDetails from "./MqttDetails";
import { SkeletonLayout } from "../common/SkeletonLayout";
const { Text, Paragraph } = Typography;
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import DeleteChannelModal from "./DeleteChannelModal";
import MobileLayout from "../mobile/MobileLayout";
import MobileChannelShow from "../mobile/channels/MobileChannelShow";
import {
  getDownlinkKey,
  getDownlinkUrl,
} from "./constants";
import ErrorMessage from "../common/ErrorMessage";

export const http_integrations = ["http", "cargo", "my_devices", "akenza", "datacake", "microshare", "tago", "ubidots", "google_sheets"]
export const mqtt_integrations = ["mqtt", "adafruit"]

class ChannelShow extends Component {
  state = {
    newName: "",
    credentials: {},
    showDownlinkToken: false,
    templateBody: undefined,
    validInput: false,
    showDeleteChannelModal: false,
  };

  componentDidMount() {
    const channelId = this.props.match.params.id;
    analyticsLogger.logEvent(
      isMobile ? "ACTION_NAV_CHANNEL_SHOW_MOBILE" : "ACTION_NAV_CHANNEL_SHOW",
      { id: channelId }
    );

    const { socket } = this.props;

    this.channel = socket.channel("graphql:channel_show", {});
    this.channel.join();
    this.channel.on(
      `graphql:channel_show:${channelId}:channel_update`,
      (message) => {
        this.props.channelShowQuery.refetch();
      }
    );

    this.devicesInFlowsChannel = socket.channel("graphql:flows_update", {});
    this.devicesInFlowsChannel.join();
    this.devicesInFlowsChannel.on(
      `graphql:flows_update:${this.props.currentOrganizationId}:organization_flows_update`,
      (_message) => {
        this.props.channelShowQuery.refetch();
      }
    );

    this.devicesInLabelsChannel = socket.channel(
      "graphql:devices_in_labels_update",
      {}
    );
    this.devicesInLabelsChannel.join();
    this.devicesInLabelsChannel.on(
      `graphql:devices_in_labels_update:${this.props.currentOrganizationId}:organization_devices_in_labels_update`,
      (_message) => {
        this.props.channelShowQuery.refetch();
      }
    );
  }

  componentWillUnmount() {
    this.channel.leave();
    this.devicesInFlowsChannel.leave();
    this.devicesInLabelsChannel.leave();
  }

  componentDidUpdate(prevProps) {
    if (
      (!prevProps.channelShowQuery.channel && this.props.channelShowQuery.channel) ||
      (this.props.channelShowQuery.channel && prevProps.channelShowQuery.channel !== this.props.channelShowQuery.channel)
    ) {
      this.channel.on(
        `graphql:channel_show:${this.props.channelShowQuery.channel.id}:channel_update`,
        (message) => {
          this.props.channelShowQuery.refetch();
        }
      );

      this.setState({
        templateBody: this.props.channelShowQuery.channel.payload_template,
        validInput: false
      });
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

  handleReceiveJoinsChange = (value) => {
    const { channel } = this.props.channelShowQuery;
    analyticsLogger.logEvent("ACTION_UPDATE_CHANNEL_RECEIVE_JOINS", {
      id: channel.id,
      receive_joins: value,
    });
    this.props.updateChannel(channel.id, { receive_joins: value });
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

  openDeleteChannelModal = () => {
    this.setState({ showDeleteChannelModal: true });
  };

  closeDeleteChannelModal = () => {
    this.setState({ showDeleteChannelModal: false });
  };

  render() {
    const { loading, error, channel } = this.props.channelShowQuery;

    if (loading)
      return (
        <>
          <MobileDisplay>
            <MobileLayout>
              <SkeletonLayout />
            </MobileLayout>
          </MobileDisplay>
          <DesktopDisplay>
            <ChannelDashboardLayout {...this.props}>
              <div style={{ padding: 40 }}>
                <SkeletonLayout />
              </div>
            </ChannelDashboardLayout>
          </DesktopDisplay>
        </>
      );

    if (error)
      return (
        <>
          <MobileDisplay>
            <MobileLayout>
              <ErrorMessage />
            </MobileLayout>
          </MobileDisplay>
          <DesktopDisplay>
            <ChannelDashboardLayout {...this.props}>
              <ErrorMessage />
            </ChannelDashboardLayout>
          </DesktopDisplay>
        </>
      );

    const downlinkKey = getDownlinkKey(channel);
    const downlinkUrl = getDownlinkUrl(channel, downlinkKey);

    const { showDownlinkToken, showDeleteChannelModal } = this.state;

    return (
      <>
        <MobileDisplay>
          <MobileLayout>
            <MobileChannelShow channel={channel} />
          </MobileLayout>
        </MobileDisplay>
        <DesktopDisplay>
          <ChannelDashboardLayout {...this.props}>
            <div className="show-page">
              <div className="show-header">
                <Text style={{ fontSize: 24, fontWeight: 600 }}>
                  {channel.name}
                </Text>
                <UserCan>
                  <div className="show-buttons">
                    <Button
                      style={{ borderRadius: 4 }}
                      type="danger"
                      icon={<DeleteOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        this.openDeleteChannelModal();
                      }}
                    >
                      Delete Integration
                    </Button>
                  </div>
                </UserCan>
              </div>
              <Card title="Integration Details" bodyStyle={{ padding: 0 }}>
                <div className="no-scroll-bar" style={{ overflowX: "scroll" }}>
                  <div style={{ padding: 24, minWidth }}>
                    <UserCan alternate={<Text strong>{channel.name}</Text>}>
                      <Input
                        name="newName"
                        placeholder={channel.name}
                        value={this.state.newName}
                        onChange={this.handleInputUpdate}
                        style={{
                          width: 300,
                          marginRight: 5,
                          verticalAlign: "middle",
                        }}
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
                          <Text strong>ID: </Text>
                          <Text code>{channel.id}</Text>
                        </Paragraph>
                        <Paragraph>
                          <Text strong>Receive Device Joins: </Text>
                          <Switch
                            style={{ marginLeft: 2 }}
                            checked={channel.receive_joins}
                            onChange={this.handleReceiveJoinsChange}
                            disabled={
                              !userCan({ role: this.props.currentRole })
                            }
                          />
                        </Paragraph>
                        <Paragraph>
                          <Text strong># Piped Devices: </Text>
                          <Text>{channel.number_devices}</Text>
                        </Paragraph>
                      </Col>
                      <Col span={12}>
                        {includes(http_integrations, channel.type) && (
                          <Card size="small" title="HTTP Details">
                            <HttpDetails channel={channel} />
                          </Card>
                        )}
                        {channel.type === "aws" && (
                          <Card size="small" title="AWS Details">
                            <AwsDetails channel={channel} />
                          </Card>
                        )}
                        {includes(mqtt_integrations, channel.type) && (
                          <Card size="small" title="MQTT Details">
                            <MqttDetails channel={channel} />
                          </Card>
                        )}
                      </Col>
                    </Row>
                    {channel.downlink_token && (
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
                          <Input
                            value={downlinkUrl}
                            style={{ marginRight: 10 }}
                          />
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
                  </div>
                </div>
              </Card>

              <ChannelConnectionDetails
                channel={channel}
                handleUpdateDetailsChange={this.handleUpdateDetailsChange}
                handleUpdateDetailsInput={this.handleUpdateDetailsInput}
                validInput={this.state.validInput}
              />

              {
                (
                  (includes(http_integrations.filter(i => i !== "my_devices"), channel.type) && channel.endpoint !== "https://lora.mydevices.com/v1/networks/helium/uplink") ||
                  channel.type == "mqtt"
                ) && (
                <ChannelPayloadTemplate
                  templateBody={this.state.templateBody || ""}
                  handleTemplateUpdate={this.handleTemplateUpdate}
                  updateChannelTemplate={this.updateChannelTemplate}
                  channel={channel}
                />
              )}
            </div>
            <DeleteChannelModal
              open={showDeleteChannelModal}
              onClose={this.closeDeleteChannelModal}
              channel={channel}
            />
          </ChannelDashboardLayout>
        </DesktopDisplay>
      </>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    socket: state.apollo.socket,
    currentOrganizationId: state.organization.currentOrganizationId,
    currentRole: state.organization.currentRole,
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
    fetchPolicy: "cache-and-network",
    variables: { id: props.match.params.id },
    name: "channelShowQuery",
  }))
);
