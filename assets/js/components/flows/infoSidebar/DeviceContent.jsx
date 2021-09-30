import React, { Component } from "react";
import { Link } from "react-router-dom";
import OutsideClick from "react-outside-click-handler";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import UserCan, { userCan } from "../../common/UserCan";
import AlertNodeSettings from "./AlertNodeSettings";
import MultiBuyNodeSettings from "./MultiBuyNodeSettings";
import DeviceCredentials from "../../devices/DeviceCredentials";
import DeleteDeviceModal from "../../devices/DeleteDeviceModal";
import DeviceShowLabelsTable from "../../devices/DeviceShowLabelsTable";
import DeviceRemoveLabelModal from "../../devices/DeviceRemoveLabelModal";
import DevicesAddLabelModal from "../../devices/DevicesAddLabelModal";
import { updateDevice } from "../../../actions/device";
import { DEVICE_SHOW } from "../../../graphql/devices";
import analyticsLogger from "../../../util/analyticsLogger";
import { displayError } from "../../../util/messages";
import withGql from "../../../graphql/withGql";
import { Typography, Button, Input, Tag, Card, Tabs, Tooltip } from "antd";
import EyeOutlined from "@ant-design/icons/EyeOutlined";
import EyeInvisibleOutlined from "@ant-design/icons/EyeInvisibleOutlined";
import EditOutlined from "@ant-design/icons/EditOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
const { Text, Paragraph } = Typography;
const { TabPane } = Tabs;
import moment from "moment";
import { SkeletonLayout } from "../../common/SkeletonLayout";
import ConfigProfileSettings from "./ConfigProfileSettings";

class DeviceContent extends Component {
  state = {
    newDevEUI: "",
    newAppEUI: "",
    newAppKey: "",
    showDevEUIInput: false,
    showAppEUIInput: false,
    showAppKeyInput: false,
    showAppKey: false,
    showDeleteDeviceModal: false,
    deviceToDelete: null,
    showDeviceRemoveLabelModal: false,
    showDevicesAddLabelModal: false,
    labelsSelected: null,
  };

  componentDidMount() {
    const deviceId = this.props.id;
    analyticsLogger.logEvent("ACTION_OPEN_DEVICE_NODE_SIDE_PANEL", {
      id: deviceId,
    });

    const { socket } = this.props;

    this.channel = socket.channel("graphql:device_show", {});
    this.channel.join();
    this.channel.on(
      `graphql:device_show:${deviceId}:device_update`,
      (message) => {
        this.props.deviceShowQuery.refetch();
      }
    );
  }

  componentWillUnmount() {
    this.channel.leave();
  }

  handleInputUpdate = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleDeviceEUIUpdate = (id) => {
    const { newDevEUI } = this.state;
    if (newDevEUI.length === 16) {
      this.props.updateDevice(id, {
        dev_eui: this.state.newDevEUI.toUpperCase(),
      });
      analyticsLogger.logEvent("ACTION_RENAME_DEVICE", {
        id: id,
        dev_eui: newDevEUI,
      });
      return this.setState({ newDevEUI: "", showDevEUIInput: false });
    }
    if (newDevEUI === "") {
      this.setState({ newDevEUI: "", showDevEUIInput: false });
    } else {
      displayError(`Device EUI must be exactly 8 bytes long`);
    }
  };

  handleAppEUIUpdate = (id) => {
    const { newAppEUI } = this.state;
    if (newAppEUI.length === 16) {
      this.props.updateDevice(id, {
        app_eui: this.state.newAppEUI.toUpperCase(),
      });
      analyticsLogger.logEvent("ACTION_RENAME_DEVICE", {
        id: id,
        app_eui: newAppEUI,
      });
      return this.setState({ newAppEUI: "", showAppEUIInput: false });
    }
    if (newAppEUI === "") {
      this.setState({ newAppEUI: "", showAppEUIInput: false });
    } else {
      displayError(`App EUI must be exactly 8 bytes long`);
    }
  };

  handleAppKeyUpdate = (id) => {
    const { newAppKey } = this.state;
    if (newAppKey.length === 32) {
      this.props.updateDevice(id, {
        app_key: this.state.newAppKey.toUpperCase(),
      });
      analyticsLogger.logEvent("ACTION_RENAME_DEVICE", {
        id: id,
        app_key: newAppKey,
      });
      return this.setState({ newAppKey: "", showAppKeyInput: false });
    }
    if (newAppKey === "") {
      this.setState({ newAppKey: "", showAppKeyInput: false });
    } else {
      displayError(`App Key must be exactly 16 bytes long`);
    }
  };

  toggleDevEUIInput = () => {
    const { showDevEUIInput } = this.state;
    this.setState({ showDevEUIInput: !showDevEUIInput });
  };

  toggleAppEUIInput = () => {
    const { showAppEUIInput } = this.state;
    this.setState({ showAppEUIInput: !showAppEUIInput });
  };

  toggleAppKeyInput = () => {
    const { showAppKeyInput } = this.state;
    this.setState({ showAppKeyInput: !showAppKeyInput });
  };

  toggleDeviceActive = (active) => {
    this.props.updateDevice(this.props.match.params.id, { active });
  };

  openDeleteDeviceModal = (device) => {
    this.setState({ showDeleteDeviceModal: true, deviceToDelete: [device] });
  };

  closeDeleteDeviceModal = () => {
    this.setState({ showDeleteDeviceModal: false });
  };

  openDeviceRemoveLabelModal = (labelsSelected) => {
    this.setState({ showDeviceRemoveLabelModal: true });
    this.setState({ labelsSelected });
  };

  closeDeviceRemoveLabelModal = () => {
    this.setState({ showDeviceRemoveLabelModal: false });
  };

  openDevicesAddLabelModal = () => {
    this.setState({ showDevicesAddLabelModal: true });
  };

  closeDevicesAddLabelModal = () => {
    this.setState({ showDevicesAddLabelModal: false });
  };

  render() {
    const {
      showDevEUIInput,
      showAppEUIInput,
      showAppKeyInput,
      showAppKey,
      showDeleteDeviceModal,
      labelsSelected,
      showDeviceRemoveLabelModal,
      showDevicesAddLabelModal,
    } = this.state;
    const { loading, error, device } = this.props.deviceShowQuery;

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

    return (
      <div>
        <div style={{ padding: "40px 40px 0px 40px" }}>
          <Text style={{ fontSize: 30, fontWeight: "bold", display: "block" }}>
            {device.name}
          </Text>
          <Text style={{ fontWeight: "bold" }}>Last Modified: </Text>
          <Text>{moment.utc(device.updated_at).local().format("l LT")}</Text>
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
            <Link to={`/devices/${this.props.id}`}>
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
                  title="Undo or save your workspace changes before deleting this device"
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
                    this.openDeleteDeviceModal(device);
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
            <Card title="Device Details">
              <Paragraph>
                <Text style={{ marginRight: 5 }} strong>
                  Name:
                </Text>
                <Text>{device.name}</Text>
              </Paragraph>
              <Paragraph>
                <Text strong>ID: </Text>
                <Text code>{device.id}</Text>
              </Paragraph>
              <Paragraph>
                <Text strong>Device EUI: </Text>
                {showDevEUIInput && (
                  <OutsideClick onOutsideClick={this.toggleDevEUIInput}>
                    <Input
                      name="newDevEUI"
                      placeholder={device.dev_eui}
                      value={this.state.newDevEUI}
                      onChange={this.handleInputUpdate}
                      maxLength={16}
                      style={{ width: 200, marginRight: 5 }}
                    />
                    <Button
                      type="primary"
                      name="newDevEUI"
                      onClick={() => this.handleDeviceEUIUpdate(device.id)}
                    >
                      Update
                    </Button>
                  </OutsideClick>
                )}
                {!showDevEUIInput && (
                  <React.Fragment>
                    {device.dev_eui && device.dev_eui.length === 16 ? (
                      <DeviceCredentials data={device.dev_eui} />
                    ) : (
                      <Text style={{ marginRight: 5 }}>Add a Device EUI</Text>
                    )}
                    <UserCan>
                      <Button size="small" onClick={this.toggleDevEUIInput}>
                        <EditOutlined />
                      </Button>
                    </UserCan>
                  </React.Fragment>
                )}
              </Paragraph>
              <Paragraph>
                <Text strong>App EUI: </Text>
                {showAppEUIInput && (
                  <OutsideClick onOutsideClick={this.toggleAppEUIInput}>
                    <Input
                      name="newAppEUI"
                      placeholder={device.app_eui}
                      value={this.state.newAppEUI}
                      onChange={this.handleInputUpdate}
                      maxLength={16}
                      style={{ width: 200, marginRight: 5 }}
                    />
                    <Button
                      type="primary"
                      name="newAppEUI"
                      onClick={() => this.handleAppEUIUpdate(device.id)}
                    >
                      Update
                    </Button>
                  </OutsideClick>
                )}
                {!showAppEUIInput && (
                  <React.Fragment>
                    {device.app_eui && device.app_eui.length === 16 ? (
                      <DeviceCredentials data={device.app_eui} />
                    ) : (
                      <Text style={{ marginRight: 5 }}>Add a App EUI</Text>
                    )}
                    <UserCan>
                      <Button size="small" onClick={this.toggleAppEUIInput}>
                        <EditOutlined />
                      </Button>
                    </UserCan>
                  </React.Fragment>
                )}
              </Paragraph>
              <Paragraph>
                <Text strong>App Key: </Text>
                {showAppKey ? (
                  <EyeOutlined
                    onClick={() => this.setState({ showAppKey: !showAppKey })}
                    style={{ marginLeft: 5 }}
                  />
                ) : (
                  <EyeInvisibleOutlined
                    onClick={() => this.setState({ showAppKey: !showAppKey })}
                    style={{ marginLeft: 5 }}
                  />
                )}
                {showAppKeyInput && (
                  <OutsideClick onOutsideClick={this.toggleAppKeyInput}>
                    <Input
                      name="newAppKey"
                      placeholder={device.app_key}
                      value={this.state.newAppKey}
                      onChange={this.handleInputUpdate}
                      maxLength={32}
                      style={{ width: 300, marginRight: 5 }}
                    />
                    <Button
                      type="primary"
                      name="newAppKey"
                      onClick={() => this.handleAppKeyUpdate(device.id)}
                    >
                      Update
                    </Button>
                  </OutsideClick>
                )}
                {!showAppKeyInput && showAppKey && (
                  <React.Fragment>
                    {device.app_key && device.app_key.length === 32 ? (
                      <DeviceCredentials data={device.app_key} />
                    ) : (
                      <Text style={{ marginRight: 5 }}>Add a App Key</Text>
                    )}
                    <Button size="small" onClick={this.toggleAppKeyInput}>
                      <EditOutlined />
                    </Button>
                  </React.Fragment>
                )}
                {!showAppKeyInput && !showAppKey && (
                  <Text code>************************</Text>
                )}
              </Paragraph>
              <Paragraph>
                <Text strong>Activation Method: </Text>
                <Tag style={{ fontWeight: 500, fontSize: 14 }} color="#9254DE">
                  OTAA
                </Tag>
              </Paragraph>
            </Card>

            <DeviceShowLabelsTable
              deviceId={device.id}
              openRemoveLabelFromDeviceModal={this.openDeviceRemoveLabelModal}
              openDevicesAddLabelModal={this.openDevicesAddLabelModal}
              from="deviceFlowsSidebar"
            />
          </TabPane>
          <TabPane tab="Alerts" key="3">
            <AlertNodeSettings type="device" nodeId={device.id} />
          </TabPane>
          <TabPane tab="Profile" key="4">
            <ConfigProfileSettings currentNode={device} nodeType="device" />
          </TabPane>
          <TabPane tab="Packets" key="5">
            <MultiBuyNodeSettings currentNode={device} />
          </TabPane>
        </Tabs>

        <DeleteDeviceModal
          open={showDeleteDeviceModal}
          onClose={this.closeDeleteDeviceModal}
          allDevicesSelected={false}
          devicesToDelete={this.state.deviceToDelete}
          totalDevices={1}
          from="deviceShow"
          doNotRedirect
          deleteResource={this.props.deleteResource}
        />

        <DeviceRemoveLabelModal
          open={showDeviceRemoveLabelModal}
          onClose={this.closeDeviceRemoveLabelModal}
          labels={labelsSelected}
          device={device}
        />

        <DevicesAddLabelModal
          open={showDevicesAddLabelModal}
          onClose={this.closeDevicesAddLabelModal}
          devicesToUpdate={[device]}
        />
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    socket: state.apollo.socket,
    currentRole: state.organization.currentRole,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ updateDevice }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  withGql(DeviceContent, DEVICE_SHOW, (props) => ({
    fetchPolicy: "cache-first",
    variables: { id: props.id },
    name: "deviceShowQuery",
  }))
);
