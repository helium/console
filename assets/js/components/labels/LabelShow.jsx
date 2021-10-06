import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import analyticsLogger from "../../util/analyticsLogger";
import UpdateLabelModal from "./UpdateLabelModal";
import LabelAddDeviceModal from "./LabelAddDeviceModal";
import DeleteDeviceModal from "../devices/DeleteDeviceModal";
import DeviceDashboardLayout from "../devices/DeviceDashboardLayout";
import RemoveDevicesFromLabelModal from "./RemoveDevicesFromLabelModal";
import { SkeletonLayout } from "../common/SkeletonLayout";
import LabelShowTable from "./LabelShowTable";
import UserCan from "../common/UserCan";
import Downlink from "../common/Downlink";
import Debug from "../common/Debug";
import { debugSidebarBackgroundColor } from "../../util/colors";
import Sidebar from "../common/Sidebar";
import DownlinkImage from "../../../img/downlink.svg";
import { updateLabel, addDevicesToLabels } from "../../actions/label";
import {
  sendClearDownlinkQueue,
  fetchDownlinkQueue,
  sendDownlinkMessage,
} from "../../actions/downlink";
import { LABEL_SHOW } from "../../graphql/labels";
import withGql from "../../graphql/withGql";
import { Typography } from "antd";
const { Text } = Typography;
import BugOutlined from "@ant-design/icons/BugOutlined";

class LabelShow extends Component {
  state = {
    showUpdateLabelModal: false,
    showLabelAddDeviceModal: false,
    showDeleteDeviceModal: false,
    showRemoveDevicesFromLabelModal: false,
    selectedDevices: [],
    showDownlinkSidebar: false,
    showDebugSidebar: false,
  };

  componentDidMount() {
    const labelId = this.props.match.params.id;
    const { socket } = this.props;

    this.channel = socket.channel("graphql:label_show", {});
    this.channel.join();
    this.channel.on(`graphql:label_show:${labelId}:label_update`, (message) => {
      this.props.labelShowQuery.refetch();
    });
  }

  componentWillUnmount() {
    this.channel.leave();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.id !== this.props.match.params.id) {
      this.channel.on(
        `graphql:label_show:${this.props.match.params.id}:label_update`,
        (message) => {
          this.props.labelShowQuery.refetch();
        }
      );
    }
  }

  openUpdateLabelModal = () => {
    this.setState({ showUpdateLabelModal: true });
  };

  closeUpdateLabelModal = () => {
    this.setState({ showUpdateLabelModal: false });
  };

  openLabelAddDeviceModal = () => {
    this.setState({ showLabelAddDeviceModal: true });
  };

  closeLabelAddDeviceModal = () => {
    this.setState({ showLabelAddDeviceModal: false });
  };

  openRemoveDevicesFromLabelModal = (selectedDevices) => {
    this.setState({ showRemoveDevicesFromLabelModal: true, selectedDevices });
  };

  closeRemoveDevicesFromLabelModal = () => {
    this.setState({ showRemoveDevicesFromLabelModal: false });
  };

  openDeleteDeviceModal = (selectedDevices) => {
    this.setState({ showDeleteDeviceModal: true, selectedDevices });
  };

  closeDeleteDeviceModal = () => {
    this.setState({ showDeleteDeviceModal: false });
  };

  setDevicesSelected = (selectedDevices) => {
    this.setState({ selectedDevices });
  };

  handleUpdateLabel = (attrs) => {
    const labelId = this.props.match.params.id;
    this.props.updateLabel(labelId, attrs);
  };

  handleToggleDownlink = () => {
    const { showDownlinkSidebar } = this.state;

    this.setState({ showDownlinkSidebar: !showDownlinkSidebar });
  };

  handleToggleDebug = () => {
    const { showDebugSidebar } = this.state;
    if (!showDebugSidebar) {
      analyticsLogger.logEvent("ACTION_OPEN_DEVICE_DEBUG", {
        id: this.props.match.params.id,
      });
    } else {
      analyticsLogger.logEvent("ACTION_CLOSE_DEVICE_DEBUG", {
        id: this.props.match.params.id,
      });
    }
    this.setState({ showDebugSidebar: !showDebugSidebar });
  };

  render() {
    const { loading, error, label } = this.props.labelShowQuery;
    const { showDeleteDeviceModal, selectedDevices } = this.state;

    if (loading)
      return (
        <DeviceDashboardLayout {...this.props}>
          <div style={{ padding: 40 }}>
            <SkeletonLayout />
          </div>
        </DeviceDashboardLayout>
      );
    if (error)
      return (
        <DeviceDashboardLayout {...this.props}>
          <div style={{ padding: 40 }}>
            <Text>
              Data failed to load, please reload the page and try again
            </Text>
          </div>
        </DeviceDashboardLayout>
      );

    const normalizedDevices = label.devices.reduce((map, device) => {
      map[device.id] = device;
      return map;
    }, {});

    return (
      <DeviceDashboardLayout {...this.props}>
        <div>
          <LabelShowTable
            labelId={this.props.match.params.id}
            label={label}
            openRemoveDevicesFromLabelModal={
              this.openRemoveDevicesFromLabelModal
            }
            userEmail={this.props.user.email}
            history={this.props.history}
            devicesSelected={this.setDevicesSelected}
            openDeleteDeviceModal={this.openDeleteDeviceModal}
            openLabelAddDeviceModal={this.openLabelAddDeviceModal}
            openUpdateLabelModal={this.openUpdateLabelModal}
          />

          <UpdateLabelModal
            handleUpdateLabel={this.handleUpdateLabel}
            open={this.state.showUpdateLabelModal}
            onClose={this.closeUpdateLabelModal}
            label={label}
          />

          <LabelAddDeviceModal
            label={label}
            labelNormalizedDevices={normalizedDevices}
            addDevicesToLabels={this.props.addDevicesToLabels}
            open={this.state.showLabelAddDeviceModal}
            onClose={this.closeLabelAddDeviceModal}
          />

          <RemoveDevicesFromLabelModal
            label={label}
            open={this.state.showRemoveDevicesFromLabelModal}
            onClose={this.closeRemoveDevicesFromLabelModal}
            devicesToRemove={selectedDevices}
          />

          <DeleteDeviceModal
            label={label}
            open={showDeleteDeviceModal}
            onClose={this.closeDeleteDeviceModal}
            allDevicesSelected={false}
            devicesToDelete={selectedDevices}
            totalDevices={selectedDevices.length}
          />
        </div>

        <Sidebar
          show={this.state.showDebugSidebar}
          toggle={this.handleToggleDebug}
          sidebarIcon={<BugOutlined />}
          iconBackground={debugSidebarBackgroundColor}
          iconPosition="top"
          message="Access Debug mode to view device packet transfer"
        >
          <Debug labelId={this.props.match.params.id} entryWidth={600} />
        </Sidebar>

        <UserCan>
          {
            <Sidebar
              show={this.state.showDownlinkSidebar}
              toggle={this.handleToggleDownlink}
              sidebarIcon={<img src={DownlinkImage} />}
              iconBackground="#40A9FF"
              iconPosition="middle"
              message="Send a manual downlink to all devices on this label"
            >
              <Downlink
                src="LabelShow"
                id={label.id}
                devices={label.devices}
                socket={this.props.socket}
                onSend={(payload, confirm, port, position) => {
                  analyticsLogger.logEvent("ACTION_DOWNLINK_SEND", {
                    label: label.id,
                  });
                  this.props.sendDownlinkMessage(
                    payload,
                    port,
                    confirm,
                    position,
                    "label",
                    label.id
                  );
                }}
                onClear={() => {
                  analyticsLogger.logEvent("ACTION_CLEAR_DOWNLINK_QUEUE", {
                    devices: label.devices.map((device) => device.id),
                  });
                  this.props.sendClearDownlinkQueue({ label_id: label.id });
                }}
                fetchDownlinkQueue={() =>
                  this.props.fetchDownlinkQueue(label.id, "label")
                }
              />
            </Sidebar>
          }
        </UserCan>
      </DeviceDashboardLayout>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    socket: state.apollo.socket,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      updateLabel,
      addDevicesToLabels,
      sendClearDownlinkQueue,
      sendDownlinkMessage,
      fetchDownlinkQueue,
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  withGql(LabelShow, LABEL_SHOW, (props) => ({
    fetchPolicy: "cache-first",
    variables: { id: props.match.params.id },
    name: "labelShowQuery",
  }))
);
