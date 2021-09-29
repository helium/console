import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import withGql from "../../../graphql/withGql";
import { Button, Typography, Card, Divider, Input, Tabs, Tooltip } from "antd";
const { TabPane } = Tabs;
const { Text, Paragraph } = Typography;
import moment from "moment";
import { CHANNEL_SHOW } from "../../../graphql/channels";
import { updateChannel } from "../../../actions/channel";
import DeleteChannelModal from "../../channels/DeleteChannelModal";
import analyticsLogger from "../../../util/analyticsLogger";
import UserCan, { userCan } from "../../common/UserCan";
import HttpDetails from "../../channels/HttpDetails";
import AwsDetails from "../../channels/AwsDetails";
import MqttDetails from "../../channels/MqttDetails";
import { CopyToClipboard } from "react-copy-to-clipboard";
import EyeOutlined from "@ant-design/icons/EyeOutlined";
import EyeInvisibleOutlined from "@ant-design/icons/EyeInvisibleOutlined";
import EditOutlined from "@ant-design/icons/EditOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import { Link } from "react-router-dom";
import AlertNodeSettings from "./AlertNodeSettings";
import { SkeletonLayout } from "../../common/SkeletonLayout";
import Warning from "../Warning";
import WarningItem from "../WarningItem";

class ChannelContent extends Component {
  state = {
    newName: "",
    showDownlinkToken: false,
    showDeleteChannelModal: false,
  };

  componentDidMount() {
    const channelId = this.props.id;
    analyticsLogger.logEvent("ACTION_OPEN_CHANNEL_NODE_SIDE_PANEL", {
      id: channelId,
    });

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

    if (this.props.channelShowQuery.channel) {
      this.setState({
        templateBody: this.props.channelShowQuery.channel.payload_template,
      });
    }
  }

  componentWillUnmount() {
    this.channel.leave();
    this.devicesInFlowsChannel.leave();
    this.devicesInLabelsChannel.leave();
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.channelShowQuery.channel &&
      prevProps.channelShowQuery.channel != this.props.channelShowQuery.channel
    ) {
      this.setState({
        templateBody: this.props.channelShowQuery.channel.payload_template,
      });
    }
  }

  handleNameChange = () => {
    const { channel } = this.props.channelShowQuery;
    analyticsLogger.logEvent("ACTION_UPDATE_CHANNEL_NAME", {
      id: channel.id,
      name: this.state.newName,
    });
    this.props.updateChannel(channel.id, { name: this.state.newName });
    this.setState({ newName: "" });
  };

  openDeleteChannelModal = () => {
    this.setState({ showDeleteChannelModal: true });
  };

  closeDeleteChannelModal = () => {
    this.setState({ showDeleteChannelModal: false });
  };

  render() {
    const { loading, error, channel } = this.props.channelShowQuery;
    const { showDownlinkToken } = this.state;

    if (loading)
      return (
        <div style={{ padding: 40 }}>
          <SkeletonLayout />
        </div>
      );
    if (error)
      return (
        <div style={{ padding: 40 }}>
          <Text>Data failed to load, please reload the page and try again</Text>
        </div>
      );

    const downlinkKey = channel.downlink_token || `{:downlink_key}`;

    let downlinkUrl = `http://localhost:4000/api/v1/down/${channel.id}/${downlinkKey}/{:optional_device_id}`;
    if (process.env.SELF_HOSTED && window.env_domain !== "localhost:4000") {
      downlinkUrl = `https://${window.env_domain}/api/v1/down/${channel.id}/${downlinkKey}/{:optional_device_id}`;
    }
    if (!process.env.SELF_HOSTED) {
      downlinkUrl = `https://${process.env.ENV_DOMAIN}/api/v1/down/${channel.id}/${downlinkKey}/{:optional_device_id}`;
    }

    return (
      <div>
        <div style={{ padding: "40px 40px 0px 40px" }}>
          <Text style={{ fontSize: 30, fontWeight: "bold", display: "block" }}>
            {channel.name}
          </Text>
          <Text style={{ fontWeight: "bold" }}>Last Modified: </Text>
          <Text>{moment.utc(channel.updated_at).local().format("l LT")}</Text>
          <div style={{ marginTop: 10, marginBottom: 10 }}>
            <UserCan>
              <Button
                style={{ borderRadius: 4, marginRight: 5 }}
                danger
                onClick={(e) => {
                  e.stopPropagation();
                  this.props.onNodeDelete();
                }}
              >
                Remove Node
              </Button>
            </UserCan>
            <Link to={`/integrations/${this.props.id}`}>
              <Button
                style={{ borderRadius: 4, marginRight: 5 }}
                icon={
                  userCan({ role: this.props.currentRole }) ? (
                    <EditOutlined />
                  ) : (
                    <EyeOutlined />
                  )
                }
              >
                {userCan({ role: this.props.currentRole }) ? "Edit" : "View"}
              </Button>
            </Link>
            <UserCan>
              {this.props.hasChanges ? (
                <Tooltip
                  title="Undo or save your workspace changes before deleting this integration"
                  overlayStyle={{ width: 230 }}
                >
                  <Button
                    style={{ borderRadius: 4, marginRight: 5 }}
                    type="danger"
                    icon={<DeleteOutlined />}
                    disabled
                  >
                    Delete
                  </Button>
                </Tooltip>
              ) : (
                <Button
                  style={{ borderRadius: 4, marginRight: 5 }}
                  type="danger"
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    this.openDeleteChannelModal();
                  }}
                >
                  Delete
                </Button>
              )}
            </UserCan>
          </div>
        </div>

        <Tabs defaultActiveKey="1" tabBarStyle={{ paddingLeft: 40 }}>
          <TabPane
            tab="Overview"
            key="1"
            style={{ padding: "0px 40px 0px 40px" }}
          >
            <React.Fragment>
              <Card title="Integration Details">
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
                <Paragraph>
                  <Text strong># Piped Devices: </Text>
                  <Text>{channel.number_devices}</Text>
                </Paragraph>
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
                      <Input
                        value={downlinkUrl}
                        style={{ marginRight: 10 }}
                        disabled
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
                        disabled
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
                    </div>
                  </UserCan>
                )}
              </Card>
              {channel.last_errored === true && (
                <React.Fragment>
                  <Warning numberWarnings={1} />
                  <WarningItem
                    warningText={
                      "The Integration is unsuccessful. Check the Integration for details."
                    }
                  />
                </React.Fragment>
              )}
            </React.Fragment>
          </TabPane>
          <TabPane tab="Alerts" key="2">
            <AlertNodeSettings
              type="integration"
              nodeId={channel.id}
            />
          </TabPane>
        </Tabs>

        <DeleteChannelModal
          open={this.state.showDeleteChannelModal}
          onClose={this.closeDeleteChannelModal}
          channel={channel}
          doNotRedirect
          deleteResource={this.props.deleteResource}
        />
      </div>
    );
  }
}

function mapStateToProps(state, _ownProps) {
  return {
    socket: state.apollo.socket,
    currentRole: state.organization.currentRole,
    currentOrganizationId: state.organization.currentOrganizationId,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ updateChannel }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  withGql(ChannelContent, CHANNEL_SHOW, (props) => ({
    fetchPolicy: "cache-and-network",
    variables: { id: props.id },
    name: "channelShowQuery",
  }))
);
