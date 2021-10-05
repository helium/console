import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQuery } from "@apollo/client";
import { Link } from "react-router-dom";
import OutsideClick from "react-outside-click-handler";
import EventsDashboard from "../events/EventsDashboard";
import UserCan, { userCan } from "../common/UserCan";
import DeviceDashboardLayout from "./DeviceDashboardLayout";
import Debug from "../common/Debug";
import Downlink from "../common/Downlink";
import Sidebar from "../common/Sidebar";
import DeviceRemoveLabelModal from "./DeviceRemoveLabelModal";
import DevicesAddLabelModal from "./DevicesAddLabelModal";
import DeviceCredentials from "./DeviceCredentials";
import DeviceShowStats from "./DeviceShowStats";
import DeleteDeviceModal from "./DeleteDeviceModal";
import DeviceFlows from "./DeviceFlows";
import { updateDevice } from "../../actions/device";
import {
  sendClearDownlinkQueue,
  fetchDownlinkQueue,
  sendDownlinkMessage,
} from "../../actions/downlink";
import { DEVICE_SHOW } from "../../graphql/devices";
import analyticsLogger from "../../util/analyticsLogger";
import { displayError } from "../../util/messages";
import DownlinkImage from "../../../img/downlink.svg";
import { debugSidebarBackgroundColor } from "../../util/colors";
import {
  Typography,
  Button,
  Input,
  Tag,
  Card,
  Row,
  Col,
  Switch,
  Popover,
} from "antd";
import EditOutlined from "@ant-design/icons/EditOutlined";
import EyeOutlined from "@ant-design/icons/EyeOutlined";
import EyeInvisibleOutlined from "@ant-design/icons/EyeInvisibleOutlined";
import BugOutlined from "@ant-design/icons/BugOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import { SkeletonLayout } from "../common/SkeletonLayout";
const { Text } = Typography;
import DeviceShowLabelsTable from "./DeviceShowLabelsTable";
import DeviceNotInFilterTableBadge from "../common/DeviceNotInFilterTableBadge";
import ProfileDropdown from "../common/ProfileDropdown";

export default (props) => {
  const deviceId = props.match.params.id;
  const dispatch = useDispatch();
  const currentOrgId = useSelector(
    (state) => state.organization.currentOrganizationId
  );
  const currentRole = useSelector((state) => state.organization.currentRole);

  const [name, setName] = useState("");
  const [devEUI, setDevEUI] = useState("");
  const [appEUI, setAppEUI] = useState("");
  const [appKey, setAppKey] = useState("");
  const [profileId, setProfileId] = useState(null);
  const [showNameInput, setShowNameInput] = useState(false);
  const [showDevEUIInput, setShowDevEUIInput] = useState(false);
  const [showAppEUIInput, setShowAppEUIInput] = useState(false);
  const [showAppKeyInput, setShowAppKeyInput] = useState(false);
  const [labelsSelected, setLabelsSelected] = useState(null);
  const [showDeviceRemoveLabelModal, setShowDeviceRemoveLabelModal] =
    useState(false);
  const [showDevicesAddLabelModal, setShowDevicesAddLabelModal] =
    useState(false);
  const [showDeleteDeviceModal, setShowDeleteDeviceModal] = useState(false);
  const [showDebugSidebar, setShowDebugSidebar] = useState(false);
  const [showDownlinkSidebar, setShowDownlinkSidebar] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState(null);
  const [showAppKey, setShowAppKey] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const socket = useSelector((state) => state.apollo.socket);
  const channel = socket.channel("graphql:device_show", {});
  const filterUpdate = socket.channel("graphql:xor_filter_update", {});

  const { loading, error, data, refetch } = useQuery(DEVICE_SHOW, {
    variables: { id: deviceId },
    skip: !deviceId,
  });
  const device = data ? data.device : {};

  useEffect(() => {
    // executed when mounted
    analyticsLogger.logEvent("ACTION_NAV_DEVICE_SHOW", { id: deviceId });

    channel.join();
    channel.on(`graphql:device_show:${deviceId}:device_update`, (_message) => {
      refetch();
    });

    filterUpdate.join();
    filterUpdate.on(
      `graphql:xor_filter_update:${currentOrgId}:organization_xor_filter_update`,
      (_message) => {
        refetch();
      }
    );

    // executed when unmounted
    return () => {
      channel.leave();
      filterUpdate.leave();
    };
  }, []);

  useEffect(() => {
    if (device) {
      setName(device.name);
      setAppEUI(device.app_eui);
      setAppKey(device.app_key);
      setDevEUI(device.dev_eui);
      setProfileId(device.config_profile_id);
    }
  }, [device]);

  const handleDeviceNameUpdate = (id, e) => {
    if (name !== "") {
      dispatch(updateDevice(id, { name: name }));
      analyticsLogger.logEvent("ACTION_RENAME_DEVICE", {
        id: id,
        name: name,
      });
      setShowNameInput(false);
    } else {
      displayError(`Device name cannot be blank`);
    }
  };

  const handleDeviceEUIUpdate = (id) => {
    if (devEUI.length === 16) {
      dispatch(
        updateDevice(id, {
          dev_eui: devEUI.toUpperCase(),
        })
      );
      analyticsLogger.logEvent("ACTION_UPDATE_DEVICE", {
        id: id,
        dev_eui: devEUI,
      });
      setShowDevEUIInput(false);
    } else {
      displayError(`Device EUI must be exactly 8 bytes long`);
    }
  };

  const handleAppEUIUpdate = (id) => {
    if (appEUI.length === 16) {
      dispatch(
        updateDevice(id, {
          app_eui: appEUI.toUpperCase(),
        })
      );
      analyticsLogger.logEvent("ACTION_UPDATE_DEVICE", {
        id: id,
        app_eui: appEUI,
      });
      setShowAppEUIInput(false);
    } else {
      displayError(`App EUI must be exactly 8 bytes long`);
    }
  };

  const handleAppKeyUpdate = (id) => {
    if (appKey.length === 32) {
      dispatch(
        updateDevice(id, {
          app_key: appKey.toUpperCase(),
        })
      );
      analyticsLogger.logEvent("ACTION_UPDATE_DEVICE", {
        id: id,
        app_key: appKey,
      });
      setShowAppKeyInput(false);
    } else {
      displayError(`App Key must be exactly 16 bytes long`);
    }
  };

  const handleProfileUpdate = (id) => {
    dispatch(
      updateDevice(id, {
        config_profile_id: profileId,
      })
    );
    analyticsLogger.logEvent("ACTION_UPDATE_DEVICE", {
      id: id,
      config_profile_id: profileId,
    });
    setShowProfileDropdown(false);
  };

  const handleToggleDownlink = () => {
    setShowDownlinkSidebar(!showDownlinkSidebar);
  };

  const handleToggleDebug = () => {
    if (!showDebugSidebar) {
      analyticsLogger.logEvent("ACTION_OPEN_DEVICE_DEBUG", {
        id: deviceId,
      });
    } else {
      analyticsLogger.logEvent("ACTION_CLOSE_DEVICE_DEBUG", {
        id: deviceId,
      });
    }
    setShowDebugSidebar(!showDebugSidebar);
  };

  const toggleNameInput = () => {
    setName(device.name);
    setShowNameInput(!showNameInput);
  };

  const toggleDevEUIInput = () => {
    setDevEUI(device.dev_eui);
    setShowDevEUIInput(!showDevEUIInput);
  };

  const toggleAppEUIInput = () => {
    setAppEUI(device.app_eui);
    setShowAppEUIInput(!showAppEUIInput);
  };

  const toggleAppKeyInput = () => {
    setAppKey(device.app_key);
    setShowAppKeyInput(!showAppKeyInput);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const openDeviceRemoveLabelModal = (labelsSelected) => {
    setShowDeviceRemoveLabelModal(true);
    setLabelsSelected(labelsSelected);
  };

  const closeDeviceRemoveLabelModal = () => {
    setShowDeviceRemoveLabelModal(false);
  };

  const openDevicesAddLabelModal = () => {
    setShowDevicesAddLabelModal(true);
  };

  const closeDevicesAddLabelModal = () => {
    setShowDevicesAddLabelModal(false);
  };

  const openDeleteDeviceModal = (device) => {
    setShowDeleteDeviceModal(true);
    setDeviceToDelete([device]);
  };

  const closeDeleteDeviceModal = () => {
    setShowDeleteDeviceModal(false);
  };

  const toggleDeviceActive = (active) => {
    dispatch(updateDevice(deviceId, { active }));
  };

  if (loading) {
    return (
      <DeviceDashboardLayout {...props}>
        <div style={{ padding: 40 }}>
          <SkeletonLayout />
        </div>
      </DeviceDashboardLayout>
    );
  }
  if (error) {
    return (
      <DeviceDashboardLayout {...props}>
        <div style={{ padding: 40 }}>
          <Text>Data failed to load, please reload the page and try again</Text>
        </div>
      </DeviceDashboardLayout>
    );
  }
  const smallerText = device.total_packets > 10000;

  return (
    <DeviceDashboardLayout {...props}>
      <div className="show-page">
        <div className="show-header">
          <div>
            <Text
              style={{
                fontSize: 24,
                fontWeight: 600,
                verticalAlign: "middle",
              }}
            >
              {device.name}
            </Text>
            {device.in_xor_filter === false && <DeviceNotInFilterTableBadge />}
          </div>

          <div className="show-buttons">
            <Popover
              content={`This device is currently ${
                device.active ? "active" : "inactive"
              }`}
              placement="top"
              overlayStyle={{ width: 140 }}
            >
              <Switch
                checked={device.active}
                onChange={toggleDeviceActive}
                disabled={!userCan({ role: currentRole })}
              />
            </Popover>
            <UserCan>
              <Button
                style={{ borderRadius: 4, marginLeft: 12 }}
                type="danger"
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  openDeleteDeviceModal(device);
                }}
              >
                Delete Device
              </Button>
            </UserCan>
          </div>
        </div>

        <Row gutter={20} type="flex">
          <Col span={15}>
            <Card
              title="Device Details"
              bodyStyle={{ paddingRight: 0, paddingLeft: 0, height: 300 }}
            >
              <div
                style={{
                  overflowX: "scroll",
                  paddingRight: 24,
                  paddingLeft: 24,
                }}
                className="no-scroll-bar"
              >
                <table style={{ minWidth: 450 }}>
                  <tbody>
                    <tr style={{ height: "30px" }}>
                      <td style={{ width: "150px" }}>
                        <Text strong>Name</Text>
                      </td>
                      <td>
                        {showNameInput ? (
                          <OutsideClick onOutsideClick={toggleNameInput}>
                            <Input
                              name="name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              style={{
                                width: 300,
                                marginRight: 5,
                                verticalAlign: "middle",
                              }}
                              suffix={`${name.length}/50`}
                              maxLength={50}
                            />
                            <Button
                              type="primary"
                              name="name"
                              onClick={() => handleDeviceNameUpdate(device.id)}
                            >
                              Update
                            </Button>
                          </OutsideClick>
                        ) : (
                          <React.Fragment>
                            <Text style={{ marginRight: 5 }}>
                              {device.name}{" "}
                            </Text>
                            <UserCan>
                              <Button size="small" onClick={toggleNameInput}>
                                <EditOutlined />
                              </Button>
                            </UserCan>
                          </React.Fragment>
                        )}
                      </td>
                    </tr>
                    <tr style={{ height: "30px" }}>
                      <td>
                        <Text strong>ID</Text>
                      </td>
                      <td>
                        <Text code style={{ whiteSpace: "nowrap" }}>
                          {device.id}
                        </Text>
                      </td>
                    </tr>
                    <tr style={{ height: "20px" }} />
                    <tr style={{ height: "30px" }}>
                      <td>
                        <Text strong>Device EUI</Text>
                      </td>
                      <td>
                        {showDevEUIInput && (
                          <OutsideClick onOutsideClick={toggleDevEUIInput}>
                            <Input
                              name="devEUI"
                              value={devEUI}
                              onChange={(e) => setDevEUI(e.target.value)}
                              maxLength={16}
                              style={{ width: 200, marginRight: 5 }}
                            />
                            <Button
                              type="primary"
                              name="devEUI"
                              onClick={() => handleDeviceEUIUpdate(device.id)}
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
                              <Text style={{ marginRight: 5 }}>
                                Add a Device EUI
                              </Text>
                            )}
                            <UserCan>
                              <Button size="small" onClick={toggleDevEUIInput}>
                                <EditOutlined />
                              </Button>
                            </UserCan>
                          </React.Fragment>
                        )}
                      </td>
                    </tr>
                    <tr style={{ height: "30px" }}>
                      <td>
                        <Text strong>App EUI</Text>
                      </td>
                      <td>
                        {showAppEUIInput && (
                          <OutsideClick onOutsideClick={toggleAppEUIInput}>
                            <Input
                              name="appEUI"
                              value={appEUI}
                              onChange={(e) => setAppEUI(e.target.value)}
                              maxLength={16}
                              style={{ width: 200, marginRight: 5 }}
                            />
                            <Button
                              type="primary"
                              name="appEUI"
                              onClick={() => handleAppEUIUpdate(device.id)}
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
                              <Text style={{ marginRight: 5 }}>
                                Add a App EUI
                              </Text>
                            )}
                            <UserCan>
                              <Button size="small" onClick={toggleAppEUIInput}>
                                <EditOutlined />
                              </Button>
                            </UserCan>
                          </React.Fragment>
                        )}
                      </td>
                    </tr>
                    <UserCan>
                      <tr style={{ height: "30px" }}>
                        <td
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <Text strong>App Key</Text>
                          {showAppKey ? (
                            <EyeOutlined
                              onClick={() => setShowAppKey(!showAppKey)}
                              style={{ marginLeft: 5 }}
                            />
                          ) : (
                            <EyeInvisibleOutlined
                              onClick={() => setShowAppKey(!showAppKey)}
                              style={{ marginLeft: 5 }}
                            />
                          )}
                        </td>
                        <td>
                          {showAppKeyInput && (
                            <OutsideClick onOutsideClick={toggleAppKeyInput}>
                              <Input
                                name="appKey"
                                value={appKey}
                                onChange={(e) => setAppKey(e.target.value)}
                                maxLength={32}
                                style={{ width: 300, marginRight: 5 }}
                              />
                              <Button
                                type="primary"
                                name="appKey"
                                onClick={() => handleAppKeyUpdate(device.id)}
                              >
                                Update
                              </Button>
                            </OutsideClick>
                          )}
                          {!showAppKeyInput && showAppKey && (
                            <React.Fragment>
                              {device.app_key &&
                              device.app_key.length === 32 ? (
                                <DeviceCredentials data={device.app_key} />
                              ) : (
                                <Text style={{ marginRight: 5 }}>
                                  Add a App Key
                                </Text>
                              )}
                              <Button size="small" onClick={toggleAppKeyInput}>
                                <EditOutlined />
                              </Button>
                            </React.Fragment>
                          )}
                          {!showAppKeyInput && !showAppKey && (
                            <Text code>************************</Text>
                          )}
                        </td>
                      </tr>
                    </UserCan>
                    <tr style={{ height: "20px" }} />
                    <tr style={{ height: "30px" }}>
                      <td style={{ width: "150px" }}>
                        <Text strong>Activation Method</Text>
                      </td>
                      <td>
                        <Tag
                          style={{ fontWeight: 500, fontSize: 14 }}
                          color="#9254DE"
                        >
                          OTAA
                        </Tag>
                      </td>
                    </tr>
                    <tr style={{ height: "30px" }}>
                      <td style={{ width: "150px" }}>
                        <Text strong>Profile </Text>
                      </td>
                      <td>
                        {!showProfileDropdown && (
                          <React.Fragment>
                            {device.config_profile ? (
                              <Link
                                to={`/config_profiles/${device.config_profile_id}`}
                              >
                                {device.config_profile.name}
                              </Link>
                            ) : (
                              <Text>
                                <i>None selected</i>
                              </Text>
                            )}
                            <Button
                              size="small"
                              style={{ marginLeft: 5 }}
                              onClick={toggleProfileDropdown}
                            >
                              <EditOutlined />
                            </Button>
                          </React.Fragment>
                        )}
                        {showProfileDropdown && (
                          <>
                            <ProfileDropdown
                              selectProfile={(id) => {
                                setProfileId(id);
                              }}
                              profileId={profileId}
                            />
                            <Button
                              style={{ marginRight: 5 }}
                              type="primary"
                              name="profile"
                              onClick={() => handleProfileUpdate(device.id)}
                            >
                              Update
                            </Button>
                            <Button
                              name="cancel"
                              onClick={toggleProfileDropdown}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </Col>

          <Col span={9}>
            <DeviceShowStats device={device} smallerText={smallerText} />
          </Col>
        </Row>

        <DeviceShowLabelsTable
          deviceId={deviceId}
          openRemoveLabelFromDeviceModal={openDeviceRemoveLabelModal}
          openDevicesAddLabelModal={openDevicesAddLabelModal}
        />

        <DeviceFlows deviceId={deviceId} />

        <Card title="Real Time Packets" bodyStyle={{ padding: 0 }}>
          <div className="no-scroll-bar" style={{ overflowX: "scroll" }}>
            <EventsDashboard device_id={device.id} />
          </div>
        </Card>
      </div>

      <DeviceRemoveLabelModal
        open={showDeviceRemoveLabelModal}
        onClose={closeDeviceRemoveLabelModal}
        labels={labelsSelected}
        device={device}
      />

      <DevicesAddLabelModal
        open={showDevicesAddLabelModal}
        onClose={closeDevicesAddLabelModal}
        devicesToUpdate={[device]}
      />

      <DeleteDeviceModal
        open={showDeleteDeviceModal}
        onClose={closeDeleteDeviceModal}
        allDevicesSelected={false}
        devicesToDelete={deviceToDelete}
        totalDevices={1}
        from="deviceShow"
      />

      <Sidebar
        show={showDebugSidebar}
        toggle={handleToggleDebug}
        sidebarIcon={<BugOutlined />}
        iconBackground={debugSidebarBackgroundColor}
        iconPosition="top"
        message="Access Debug mode to view device packet transfer"
      >
        <Debug deviceId={deviceId} entryWidth={600} />
      </Sidebar>

      <UserCan>
        {
          <Sidebar
            show={showDownlinkSidebar}
            toggle={handleToggleDownlink}
            sidebarIcon={<img src={DownlinkImage} />}
            iconBackground="#40A9FF"
            iconPosition="middle"
            message="Send a manual downlink to this device"
          >
            <Downlink
              src="DeviceShow"
              id={device.id}
              devices={[device]}
              socket={socket}
              onSend={(payload, confirm, port, position) => {
                analyticsLogger.logEvent("ACTION_DOWNLINK_SEND", {
                  device: device.id,
                });
                dispatch(
                  sendDownlinkMessage(
                    payload,
                    port,
                    confirm,
                    position,
                    "device",
                    device.id
                  )
                );
              }}
              onClear={() => {
                analyticsLogger.logEvent("ACTION_CLEAR_DOWNLINK_QUEUE", {
                  devices: [device.id],
                });
                dispatch(sendClearDownlinkQueue({ device_id: device.id }));
              }}
              fetchDownlinkQueue={() =>
                dispatch(fetchDownlinkQueue(device.id, "device"))
              }
            />
          </Sidebar>
        }
      </UserCan>
    </DeviceDashboardLayout>
  );
};
