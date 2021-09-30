import React, { Component } from "react";
import withGql from "../../../graphql/withGql";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Link } from "react-router-dom";
import moment from "moment";
import UserCan, { userCan } from "../../common/UserCan";
import analyticsLogger from "../../../util/analyticsLogger";
import DeleteLabelModal from "../../labels/DeleteLabelModal";
import AlertNodeSettings from "./AlertNodeSettings";
import MultiBuyNodeSettings from "./MultiBuyNodeSettings";
import { redForTablesDeleteText } from "../../../util/colors";
import { updateDevice, setDevicesActive } from "../../../actions/device";
import { updateLabel, addDevicesToLabels } from "../../../actions/label";
import { PAGINATED_DEVICES_BY_LABEL } from "../../../graphql/devices";
import LabelAddDeviceModal from "../../labels/LabelAddDeviceModal";
import {
  Card,
  Button,
  Typography,
  Table,
  Pagination,
  Select,
  Popover,
  Switch,
  Tabs,
  Tooltip,
} from "antd";
import { StatusIcon } from "../../common/StatusIcon";
import EditOutlined from "@ant-design/icons/EditOutlined";
import EyeOutlined from "@ant-design/icons/EyeOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import CloseOutlined from "@ant-design/icons/CloseOutlined";
import RemoveDevicesFromLabelModal from "../../labels/RemoveDevicesFromLabelModal";
import { LABEL_SHOW } from "../../../graphql/labels";
import { SkeletonLayout } from "../../common/SkeletonLayout";
const { Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const DEFAULT_COLUMN = "name";
const DEFAULT_ORDER = "asc";
import DeviceNotInFilterTableBadge from "../../common/DeviceNotInFilterTableBadge";
import Warning from "../Warning";
import WarningItem from "../WarningItem";
import ConfigProfileSettings from "./ConfigProfileSettings";

class LabelContent extends Component {
  state = {
    page: 1,
    pageSize: 10,
    selectedRows: [],
    column: DEFAULT_COLUMN,
    order: DEFAULT_ORDER,
    showRemoveDevicesFromLabelModal: false,
    selectedDevices: [],
    showRemoveDevicesFromLabelModal: false,
    showLabelAddDeviceModal: false,
    showDeleteLabelModal: false,
  };

  componentDidMount() {
    const { socket, id } = this.props;
    analyticsLogger.logEvent("ACTION_OPEN_LABEL_NODE_SIDE_PANEL", {
      id,
    });

    this.channel = socket.channel("graphql:label_show_table", {});
    this.channel.join();
    this.channel.on(
      `graphql:label_show_table:${id}:update_label_devices`,
      (message) => {
        const { page, pageSize, column, order } = this.state;
        this.refetchPaginatedEntries(page, pageSize, column, order);
      }
    );

    this.labelChannel = socket.channel("graphql:label_show", {});
    this.labelChannel.join();
    this.labelChannel.on(
      `graphql:label_show:${this.props.id}:label_update`,
      (message) => {
        this.props.labelQuery.refetch();
      }
    );

    this.filterUpdateChannel = socket.channel("graphql:xor_filter_update", {});
    this.filterUpdateChannel.join();
    this.filterUpdateChannel.on(
      `graphql:xor_filter_update:${this.props.orgId}:organization_xor_filter_update`,
      (message) => {
        const { page, pageSize, column, order } = this.state;
        this.refetchPaginatedEntries(page, pageSize, column, order);
      }
    );

    if (!this.props.paginatedDevicesQuery.loading) {
      const { page, pageSize, column, order } = this.state;
      this.refetchPaginatedEntries(page, pageSize, column, order);
    }
  }

  componentWillUnmount() {
    this.channel.leave();
    this.labelChannel.leave();
    this.filterUpdateChannel.leave();
  }

  handleSelectOption = (value) => {
    if (value === "remove") {
      this.openRemoveDevicesFromLabelModal(this.state.selectedDevices);
    } else if (value === "addDevices") {
      this.openLabelAddDeviceModal();
    } else if (value === "setActive") {
      this.props.setDevicesActive(
        this.state.selectedDevices.map((r) => r.id),
        true,
        this.props.labelId
      );
    } else if (value === "setInactive") {
      this.props.setDevicesActive(
        this.state.selectedDevices.map((r) => r.id),
        false,
        this.props.labelId
      );
    }
  };

  handleChangePage = (page) => {
    this.setState({ page });

    const { pageSize, column, order } = this.state;
    this.refetchPaginatedEntries(page, pageSize, column, order);
  };

  handleSortChange = (pagi, filter, sorter) => {
    const { page, pageSize, order, column } = this.state;

    if (column == sorter.field && order == "asc") {
      this.setState({ order: "desc" });
      this.refetchPaginatedEntries(page, pageSize, column, "desc");
    }
    if (column == sorter.field && order == "desc") {
      this.setState({ order: "asc" });
      this.refetchPaginatedEntries(page, pageSize, column, "asc");
    }
    if (column != sorter.field) {
      this.setState({ column: sorter.field, order: "asc" });
      this.refetchPaginatedEntries(page, pageSize, sorter.field, "asc");
    }
  };

  refetchPaginatedEntries = (page, pageSize, column, order) => {
    const { refetch } = this.props.paginatedDevicesQuery;
    refetch({ page, pageSize, column, order });
  };

  toggleDeviceActive = (active, id) => {
    this.props.updateDevice(id, { active });
  };

  setDevicesSelected = (selectedDevices) => {
    this.setState({ selectedDevices });
  };

  openRemoveDevicesFromLabelModal = (selectedDevices) => {
    this.setState({ showRemoveDevicesFromLabelModal: true, selectedDevices });
  };

  closeRemoveDevicesFromLabelModal = () => {
    this.setState({ showRemoveDevicesFromLabelModal: false });
  };

  openRemoveDevicesFromLabelModal = (selectedDevices) => {
    this.setState({ showRemoveDevicesFromLabelModal: true, selectedDevices });
  };

  openLabelAddDeviceModal = () => {
    this.setState({ showLabelAddDeviceModal: true });
  };

  closeLabelAddDeviceModal = () => {
    this.setState({ showLabelAddDeviceModal: false });
  };

  openDeleteLabelModal = () => {
    this.setState({ showDeleteLabelModal: true });
  };

  closeDeleteLabelModal = () => {
    this.setState({ showDeleteLabelModal: false });
  };

  render() {
    const columns = [
      {
        title: "Device Name",
        dataIndex: "name",
        sorter: true,
        render: (text, record) => (
          <React.Fragment>
            <Link to={`/devices/${record.id}`}>{text}</Link>
            {moment()
              .utc()
              .local()
              .subtract(1, "days")
              .isBefore(moment.utc(record.last_connected).local()) && (
              <StatusIcon tooltipTitle="Last connected within the last 24h" />
            )}
            {record.in_xor_filter === false && <DeviceNotInFilterTableBadge />}
          </React.Fragment>
        ),
      },
      {
        title: "",
        key: "action",
        render: (text, record) => (
          <div>
            <Popover
              content={`This device is currently ${
                record.active ? "active" : "inactive"
              }`}
              placement="top"
              overlayStyle={{ width: 140 }}
            >
              <Switch
                checked={record.active}
                onChange={(active, e) => {
                  e.stopPropagation();
                  this.toggleDeviceActive(active, record.id);
                }}
                disabled={!userCan({ role: this.props.currentRole })}
              />
            </Popover>
            <UserCan>
              <Tooltip title="Remove from Label">
                <Button
                  type="danger"
                  icon={<CloseOutlined />}
                  shape="circle"
                  size="small"
                  style={{ marginLeft: 8 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    this.openRemoveDevicesFromLabelModal([record]);
                  }}
                />
              </Tooltip>
            </UserCan>
          </div>
        ),
      },
    ];

    const { loading, error, devices_by_label } =
      this.props.paginatedDevicesQuery;
    const {
      label,
      error: labelError,
      loading: labelLoading,
    } = this.props.labelQuery;

    if (loading || labelLoading)
      return (
        <div style={{ padding: 40 }}>
          <SkeletonLayout />
        </div>
      );
    if (error || labelError)
      return (
        <div style={{ padding: 40 }}>
          <Text>Data failed to load, please reload the page and try again</Text>
        </div>
      );

    const rowSelection = {
      onChange: (keys, selectedRows) => {
        this.setDevicesSelected(selectedRows);
      },
    };

    const { selectedDevices } = this.state;
    const normalizedDevices = label.devices.reduce((map, device) => {
      map[device.id] = device;
      return map;
    }, {});

    return (
      <div>
        <div style={{ padding: "40px 40px 0px 40px" }}>
          <Text style={{ fontSize: 30, fontWeight: "bold", display: "block" }}>
            {label && label.name}
          </Text>
          <Text style={{ fontWeight: "bold" }}>Last Modified: </Text>
          <Text>{moment.utc(label.updated_at).local().format("l LT")}</Text>
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
            <Link to={`/labels/${this.props.id}`}>
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
                  title="Undo or save your workspace changes before deleting this label"
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
                    this.openDeleteLabelModal();
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
              <Card title="Grouped Devices">
                <Select
                  value="Quick Action"
                  style={{ width: 295 }}
                  onSelect={this.handleSelectOption}
                >
                  <Option value="addDevices">Add this Label to a Device</Option>
                  {selectedDevices.find((r) => r.active === false) && (
                    <Option
                      value="setActive"
                      disabled={selectedDevices.length === 0}
                    >
                      Resume Packet Transfer for Selected Devices
                    </Option>
                  )}

                  {(selectedDevices.length === 0 ||
                    !selectedDevices.find((r) => r.active === false)) && (
                    <Option
                      value="setInactive"
                      disabled={selectedDevices.length === 0}
                    >
                      Pause Packet Transfer for Selected Devices
                    </Option>
                  )}
                  <Option
                    disabled={selectedDevices.length === 0}
                    value="remove"
                    style={{
                      color:
                        selectedDevices.length === 0
                          ? ""
                          : redForTablesDeleteText,
                    }}
                  >
                    Remove Selected Devices from Label
                  </Option>
                </Select>
                <Table
                  showSorterTooltip={false}
                  sortDirections={["descend", "ascend", "descend"]}
                  onRow={(record, rowIndex) => ({
                    onClick: () =>
                      this.props.history.push(`/devices/${record.id}`),
                  })}
                  columns={columns}
                  dataSource={devices_by_label.entries}
                  rowKey={(record) => record.id}
                  pagination={false}
                  rowSelection={rowSelection}
                  onChange={this.handleSortChange}
                  style={{ maxHeight: 400, overflow: "scroll" }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    paddingBottom: 0,
                  }}
                >
                  <Pagination
                    current={devices_by_label.pageNumber}
                    pageSize={devices_by_label.pageSize}
                    total={devices_by_label.totalEntries}
                    onChange={(page) => this.handleChangePage(page)}
                    style={{ marginBottom: 20 }}
                    showSizeChanger={false}
                  />
                </div>
              </Card>
              {label.devices.length === 0 && (
                <React.Fragment>
                  <Warning numberWarnings={1} />
                  <WarningItem
                    warningText={
                      "The Label contains no devices. Add at least 1 device to the Label."
                    }
                  />
                </React.Fragment>
              )}
            </React.Fragment>
          </TabPane>
          <TabPane tab="Alerts" key="3">
            <AlertNodeSettings type="label" nodeId={label.id} />
          </TabPane>
          <TabPane tab="Profile" key="4">
            <ConfigProfileSettings currentNode={label} nodeType="label" />
          </TabPane>
          <TabPane tab="Packets" key="5">
            <MultiBuyNodeSettings currentNode={label} />
          </TabPane>
        </Tabs>

        <RemoveDevicesFromLabelModal
          label={label}
          open={this.state.showRemoveDevicesFromLabelModal}
          onClose={this.closeRemoveDevicesFromLabelModal}
          devicesToRemove={this.state.selectedDevices}
        />
        <LabelAddDeviceModal
          label={label}
          labelNormalizedDevices={normalizedDevices}
          addDevicesToLabels={this.props.addDevicesToLabels}
          open={this.state.showLabelAddDeviceModal}
          onClose={this.closeLabelAddDeviceModal}
        />
        <DeleteLabelModal
          open={this.state.showDeleteLabelModal}
          onClose={this.closeDeleteLabelModal}
          labelId={label.id}
          doNotRedirect
          deleteResource={this.props.deleteResource}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    socket: state.apollo.socket,
    currentRole: state.organization.currentRole,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    { updateDevice, setDevicesActive, addDevicesToLabels, updateLabel },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  withGql(
    withGql(LabelContent, PAGINATED_DEVICES_BY_LABEL, (props) => ({
      fetchPolicy: "cache-first",
      variables: {
        page: 1,
        pageSize: 10,
        labelId: props.id,
        column: DEFAULT_COLUMN,
        order: DEFAULT_ORDER,
      },
      name: "paginatedDevicesQuery",
    })),
    LABEL_SHOW,
    (props) => ({
      fetchPolicy: "cache-first",
      variables: { id: props.id },
      name: "labelQuery",
    })
  )
);
