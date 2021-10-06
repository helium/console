import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import ChooseImportType from "./import/ChooseImportType";
import { createDevice } from "../../actions/device";
import { displayInfo, displayError } from "../../util/messages";
import withGql from "../../graphql/withGql";
import { ALL_IMPORTS } from "../../graphql/devices";
import { ALL_LABELS } from "../../graphql/labels";
import UserCan from "../common/UserCan";
import DeviceDashboardLayout from "./DeviceDashboardLayout";
import ImportDevicesModal from "./import/ImportDevicesModal";
import analyticsLogger from "../../util/analyticsLogger";
import { minWidth } from "../../util/constants";
import { Card, Button, Typography, Input, Row, Col } from "antd";
import EyeOutlined from "@ant-design/icons/EyeOutlined";
import EyeInvisibleOutlined from "@ant-design/icons/EyeInvisibleOutlined";
import SaveOutlined from "@ant-design/icons/SaveOutlined";
import LabelAppliedNew from "../common/LabelAppliedNew";
const { Text } = Typography;
import find from "lodash/find";
import ProfileDropdown from "../common/ProfileDropdown";

class DeviceNew extends Component {
  nameInputRef = React.createRef();

  state = {
    name: "",
    devEUI: process.env.SELF_HOSTED
      ? randomString(16)
      : "6081F9" + randomString(10),
    appEUI: process.env.SELF_HOSTED
      ? randomString(16)
      : this.props.currentOrganizationAppEui,
    appKey: randomString(32),
    labelName: null,
    showAppKey: false,
    showImportDevicesModal: false,
    importComplete: false,
    importType: "",
    page: 1,
    pageSize: 10,
    import_status: { failed_devices: [] },
    configProfileId: null,
  };

  componentDidMount() {
    if (this.nameInputRef.current) {
      this.nameInputRef.current.focus();
    }

    const { socket, currentOrganizationId, user } = this.props;
    this.importChannel = socket.channel("graphql:device_import_update", {});
    this.importChannel.join();
    this.importChannel.on(
      `graphql:device_import_update:${currentOrganizationId}:import_list_updated`,
      (message) => {
        const { page, pageSize } = this.state;
        this.props.importsQuery.refetch({ page, pageSize });
        const user_id = user.sub.startsWith("auth0")
          ? user.sub.slice(6)
          : user.sub;

        this.setState({ importComplete: true });

        if (user_id === message.user_id && message.status === "success") {
          displayInfo(
            `Imported ${message.successful_devices} device${
              (message.successful_devices !== 1 && "s") || ""
            } from ${
              message.type === "ttn" ? "The Things Network" : "CSV"
            }. Refresh this page to see the changes.`
          );
          this.setState({
            import_status: {
              failed_devices: message.failed_devices,
              successful_count: message.successful_devices,
            },
          });
        }
        if (user_id === message.user_id && message.status === "failed") {
          displayError(
            `Failed to import devices from ${
              message.type === "ttn" ? "The Things Network" : "CSV"
            }.`
          );
          this.setState({
            import_status: {
              failed_devices: message.failed_devices || [],
            },
          });
        }
      }
    );
  }

  componentWillUnmount() {
    this.importChannel.leave();
  }

  handleInputUpdate = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { name, devEUI, appEUI, appKey, labelName, configProfileId } =
      this.state;
    if (devEUI.length === 16 && appEUI.length === 16 && appKey.length === 32) {
      analyticsLogger.logEvent("ACTION_CREATE_DEVICE", {
        name: name,
        devEUI: devEUI,
        appEUI: appEUI,
        appKey: appKey,
        configProfileId: configProfileId,
      });
      let foundLabel = find(this.props.allLabelsQuery.allLabels, {
        name: labelName,
      });
      let label = foundLabel
        ? { labelApplied: foundLabel.id }
        : { newLabel: labelName };
      this.props
        .createDevice(
          {
            name,
            dev_eui: devEUI.toUpperCase(),
            app_eui: appEUI.toUpperCase(),
            app_key: appKey.toUpperCase(),
            config_profile_id: configProfileId,
          },
          label
        )
        .then(() => {
          this.props.history.push("/devices");
        });
    } else {
      displayError(
        `Please ensure your device credentials are of the correct length.`
      );
    }
  };

  setImportType = (importType) => {
    this.setState({ importType, showImportDevicesModal: true });
  };

  closeImportDevicesModal = () => {
    this.setState({
      showImportDevicesModal: false,
      importComplete: false,
      import_status: { failed_devices: [] },
    });
  };

  render() {
    const { allLabels, error } = this.props.allLabelsQuery;
    const { showImportDevicesModal, importComplete, importType } = this.state;
    const { device_imports } = this.props.importsQuery;

    return (
      <DeviceDashboardLayout {...this.props}>
        <div className="no-scroll-bar" style={{ overflowX: "scroll" }}>
          <div style={{ padding: "30px 30px 20px 30px", minWidth }}>
            <Text style={{ fontSize: 22, fontWeight: 600 }}>
              Add New Device
            </Text>
            <div>
              <p style={{ fontSize: 16 }}>
                <b>Important:</b> The first time a device joins the Network
                could take up to 20 mins.{" "}
                <a
                  className="help-link"
                  href="https://docs.helium.com/use-the-network/console/adding-devices/#important-information-when-adding-devices"
                  target="_blank"
                >
                  Learn more about adding devices
                </a>
              </p>
            </div>
            <Row gutter={30} style={{ marginTop: 10 }}>
              <Col span={14}>
                <Card title="Enter Device Details">
                  <Input
                    placeholder="Device Name"
                    name="name"
                    value={this.state.name}
                    onChange={this.handleInputUpdate}
                    addonBefore="Name"
                    ref={this.nameInputRef}
                    autoFocus
                    suffix={`${this.state.name.length}/50`}
                    maxLength={50}
                  />

                  <Input
                    placeholder="Device EUI"
                    name="devEUI"
                    value={this.state.devEUI}
                    onChange={this.handleInputUpdate}
                    style={{ marginTop: 10 }}
                    maxLength={16}
                    addonBefore="Dev EUI"
                    suffix={
                      <Text
                        type={this.state.devEUI.length !== 16 ? "danger" : ""}
                      >
                        {Math.floor(this.state.devEUI.length / 2)} / 8 Bytes
                      </Text>
                    }
                  />

                  <Input
                    placeholder="App EUI"
                    name="appEUI"
                    value={this.state.appEUI}
                    onChange={this.handleInputUpdate}
                    style={{ marginTop: 10 }}
                    maxLength={16}
                    addonBefore="App EUI"
                    suffix={
                      <Text
                        type={this.state.appEUI.length !== 16 ? "danger" : ""}
                      >
                        {Math.floor(this.state.appEUI.length / 2)} / 8 Bytes
                      </Text>
                    }
                  />

                  <Input
                    placeholder="App Key"
                    name="appKey"
                    value={
                      this.state.showAppKey ? this.state.appKey : "✱".repeat(28)
                    }
                    disabled={!this.state.showAppKey}
                    onChange={this.handleInputUpdate}
                    style={{ marginTop: 10 }}
                    maxLength={56}
                    addonBefore={
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        App Key
                        {this.state.showAppKey ? (
                          <EyeOutlined
                            onClick={() =>
                              this.setState({
                                showAppKey: !this.state.showAppKey,
                              })
                            }
                            style={{ marginLeft: 5 }}
                          />
                        ) : (
                          <EyeInvisibleOutlined
                            onClick={() =>
                              this.setState({
                                showAppKey: !this.state.showAppKey,
                              })
                            }
                            style={{ marginLeft: 5 }}
                          />
                        )}
                      </div>
                    }
                    suffix={
                      <Text
                        type={this.state.appKey.length !== 32 ? "danger" : ""}
                      >
                        {Math.floor(this.state.appKey.length / 2)} / 16 Bytes
                      </Text>
                    }
                  />
                  <Text style={{ marginTop: 25, display: "block" }} strong>
                    Profile (Optional)
                  </Text>
                  <ProfileDropdown
                    selectProfile={(id) => {
                      this.setState({ configProfileId: id });
                    }}
                  />

                  <Text style={{ marginTop: 25, display: "block" }} strong>
                    Attach a Label (Optional)
                  </Text>
                  <LabelAppliedNew
                    allLabels={allLabels}
                    value={this.state.labelName}
                    select={(value) => this.setState({ labelName: value })}
                  />
                </Card>
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-end",
                  }}
                >
                  <UserCan>
                    <Button
                      key="submit"
                      icon={<SaveOutlined />}
                      onClick={this.handleSubmit}
                      style={{ margin: 0 }}
                    >
                      Save Device
                    </Button>
                  </UserCan>
                </div>
              </Col>
              <Col span={10}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <ChooseImportType
                    onImportSelect={this.setImportType}
                    deviceImports={device_imports}
                  />
                </div>
              </Col>
            </Row>
          </div>
        </div>

        <ImportDevicesModal
          open={showImportDevicesModal}
          onClose={this.closeImportDevicesModal}
          importComplete={importComplete}
          importType={importType}
          import_status={this.state.import_status}
        />
      </DeviceDashboardLayout>
    );
  }
}

const randomString = (length) => {
  let chars = "0123456789ABCDEF";
  let result = "";
  for (var i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

function mapStateToProps(state) {
  return {
    currentOrganizationId: state.organization.currentOrganizationId,
    currentOrganizationAppEui: state.organization.currentOrganizationAppEui,
    socket: state.apollo.socket,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createDevice }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  withGql(
    withGql(DeviceNew, ALL_LABELS, (props) => ({
      fetchPolicy: "cache-and-network",
      variables: {},
      name: "allLabelsQuery",
    })),
    ALL_IMPORTS,
    (props) => ({
      fetchPolicy: "cache-first",
      variables: { page: 1, pageSize: 10 },
      name: "importsQuery",
    })
  )
);
