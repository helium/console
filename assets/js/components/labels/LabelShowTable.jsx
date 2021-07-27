import React, { Component } from "react";
import withGql from "../../graphql/withGql";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Link } from "react-router-dom";
import moment from "moment";
import DeleteLabelModal from "./DeleteLabelModal";
import LabelTag from "../common/LabelTag";
import UserCan from "../common/UserCan";
import { redForTablesDeleteText } from "../../util/colors";
import { minWidth } from "../../util/constants";
import { updateDevice, setDevicesActive } from "../../actions/device";
import { PAGINATED_DEVICES_BY_LABEL } from "../../graphql/devices";
import {
  Button,
  Typography,
  Table,
  Pagination,
  Checkbox,
  Select,
  Popover,
  Switch,
  Tooltip,
  Tag,
} from "antd";
import { StatusIcon } from "../common/StatusIcon";
import CloseOutlined from "@ant-design/icons/CloseOutlined";
import SettingOutlined from "@ant-design/icons/SettingOutlined";
import { SkeletonLayout } from "../common/SkeletonLayout";
const { Text } = Typography;
const { Option } = Select;
const DEFAULT_COLUMN = "name";
const DEFAULT_ORDER = "asc";
import inXORFilterDeviceTag from "../../../img/in_xor_filter/in-xor-filter-device-table-tag.svg";

const columnKeyNameText = {
  dev_eui: "Device EUI",
  labels: "Labels",
  frame_up: "Frame Up",
  frame_down: "Frame Down",
  total_packets: "Packets Transferred",
  dc_usage: "DC Used",
  inserted_at: "Date Activated",
  last_connected: "Last Connected",
};

class LabelShowTable extends Component {
  state = {
    page: 1,
    pageSize: 10,
    selectedRows: [],
    column: DEFAULT_COLUMN,
    order: DEFAULT_ORDER,
    showDeleteLabelModal: false,
    columnsToShow: {
      dev_eui: true,
      labels: true,
      frame_up: true,
      frame_down: true,
      total_packets: true,
      dc_usage: true,
      inserted_at: true,
      last_connected: true,
    },
  };

  componentDidMount() {
    const { socket, labelId } = this.props;

    this.channel = socket.channel("graphql:label_show_table", {});
    this.channel.join();
    this.channel.on(
      `graphql:label_show_table:${labelId}:update_label_devices`,
      (message) => {
        const { page, pageSize, column, order } = this.state;
        this.refetchPaginatedEntries(page, pageSize, column, order);
      }
    );

    if (!this.props.paginatedDevicesQuery.loading) {
      const { page, pageSize, column, order } = this.state;
      this.refetchPaginatedEntries(page, pageSize, column, order);
    }

    const columnsToShow = localStorage.getItem(
      `columnsToShow-${this.props.userEmail}`
    );
    if (columnsToShow) {
      this.setState({ columnsToShow: JSON.parse(columnsToShow) });
    }
    this.handleChangePage(1);
  }

  componentWillUnmount() {
    this.channel.leave();
  }

  handleSelectOption = (value) => {
    if (value === "remove") {
      this.props.openRemoveDevicesFromLabelModal(this.state.selectedRows);
    } else if (value === "addDevices") {
      this.props.openLabelAddDeviceModal();
    } else if (value === "setActive") {
      this.props.setDevicesActive(
        this.state.selectedRows.map((r) => r.id),
        true,
        this.props.labelId
      );
    } else if (value === "setInactive") {
      this.props.setDevicesActive(
        this.state.selectedRows.map((r) => r.id),
        false,
        this.props.labelId
      );
    } else if (value === "delete") {
      this.props.openDeleteDeviceModal(this.state.selectedRows);
    } else if (value === "deleteLabel") {
      this.setState({ showDeleteLabelModal: true });
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

  updateColumns = (key, checked) => {
    const { columnsToShow } = this.state;
    const updatedColumnsToShow = Object.assign({}, columnsToShow, {
      [key]: checked,
    });
    this.setState({ columnsToShow: updatedColumnsToShow });
    localStorage.setItem(
      `columnsToShow-${this.props.userEmail}`,
      JSON.stringify(updatedColumnsToShow)
    );
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
            {record.in_xor_filter === false && (
              <Tooltip title="Device not yet in XOR filter">
                <Tag
                  style={{
                    marginLeft: 10,
                    padding: 5,
                    backgroundColor: "transparent",
                    color: "#2C79EE",
                    borderColor: "#2C79EE",
                    borderRadius: 33,
                    borderWidth: 1,
                  }}
                  icon={
                    <img
                      src={inXORFilterDeviceTag}
                      style={{ height: 14, marginRight: 5 }}
                    />
                  }
                >
                  Pending...
                </Tag>
              </Tooltip>
            )}
          </React.Fragment>
        ),
      },
      {
        title: "Device EUI",
        dataIndex: "dev_eui",
        sorter: true,
        render: (text, record) => <Text code>{text}</Text>,
      },
      {
        title: "Labels",
        dataIndex: "labels",
        render: (text, record) => (
          <span>
            {record.labels.map((l) => {
              if (this.props.labelId === l.id) {
                return <LabelTag key={l.id} text={l.name} />;
              } else {
                return (
                  <Link key={l.id} to={`/labels/${l.id}`}>
                    <LabelTag text={l.name} />
                  </Link>
                );
              }
            })}
          </span>
        ),
      },
      {
        title: "Frame Up",
        sorter: true,
        dataIndex: "frame_up",
      },
      {
        title: "Frame Down",
        sorter: true,
        dataIndex: "frame_down",
      },
      {
        title: "Packets Transferred",
        sorter: true,
        dataIndex: "total_packets",
      },
      {
        title: "DC Used",
        sorter: true,
        dataIndex: "dc_usage",
      },
      {
        title: "Date Activated",
        dataIndex: "inserted_at",
        sorter: true,
        render: (data) => moment.utc(data).local().format("lll"),
      },
      {
        title: "Last Connected",
        dataIndex: "last_connected",
        sorter: true,
        render: (data) => (data ? moment.utc(data).local().format("lll") : ""),
      },
      {
        title: "",
        key: "action",
        render: (text, record) => (
          <div>
            <UserCan>
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
                />
              </Popover>
              <Tooltip title="Remove from Label">
                <Button
                  type="danger"
                  icon={<CloseOutlined />}
                  shape="circle"
                  size="small"
                  style={{ marginLeft: 8 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    this.props.openRemoveDevicesFromLabelModal([record]);
                  }}
                />
              </Tooltip>
            </UserCan>
          </div>
        ),
      },
    ].filter((col) => {
      if (col.dataIndex == "name" || col.key == "action") return true;
      return this.state.columnsToShow[col.dataIndex];
    });

    const { loading, error, devices_by_label } =
      this.props.paginatedDevicesQuery;
    const { devicesSelected, label } = this.props;

    if (loading)
      return (
        <div style={{ padding: 40 }}>
          <SkeletonLayout />
        </div>
      );
    if (error)
      return (
        <Text>Data failed to load, please reload the page and try again</Text>
      );

    const rowSelection = {
      onChange: (keys, selectedRows) => {
        this.setState({ selectedRows });
        devicesSelected(selectedRows);
      },
    };

    const { selectedRows } = this.state;

    return (
      <div className="no-scroll-bar" style={{ overflowX: "scroll" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            padding: "30px 20px 20px 30px",
            minWidth,
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: 600 }}>{label.name}</Text>
          <div>
            <UserCan>
              <Popover
                trigger="click"
                placement="bottom"
                content={
                  <div>
                    {Object.keys(this.state.columnsToShow).map((key) => (
                      <div key={key}>
                        <Checkbox
                          onChange={(e) =>
                            this.updateColumns(key, e.target.checked)
                          }
                          checked={this.state.columnsToShow[key]}
                        >
                          {columnKeyNameText[key]}
                        </Checkbox>
                      </div>
                    ))}
                  </div>
                }
              >
                <Button style={{ marginRight: 10 }}>Edit Columns</Button>
              </Popover>
              <Button
                icon={<SettingOutlined />}
                style={{ borderRadius: 4, marginRight: 10 }}
                onClick={this.props.openUpdateLabelModal}
              >
                Label Settings
              </Button>
              <Select
                value="Quick Action"
                style={{ width: 300 }}
                onSelect={this.handleSelectOption}
              >
                <Option value="addDevices">Add this Label to a Device</Option>
                {selectedRows.find((r) => r.active === false) && (
                  <Option
                    value="setActive"
                    disabled={selectedRows.length === 0}
                  >
                    Resume Packet Transfer for Selected Devices
                  </Option>
                )}

                {(selectedRows.length === 0 ||
                  !selectedRows.find((r) => r.active === false)) && (
                  <Option
                    value="setInactive"
                    disabled={selectedRows.length === 0}
                  >
                    Pause Packet Transfer for Selected Devices
                  </Option>
                )}
                <Option
                  disabled={selectedRows.length === 0}
                  value="remove"
                  style={{
                    color:
                      selectedRows.length === 0 ? "" : redForTablesDeleteText,
                  }}
                >
                  Remove Selected Devices from Label
                </Option>
                <Option
                  value="delete"
                  disabled={selectedRows.length === 0}
                  style={{
                    color:
                      selectedRows.length === 0 ? "" : redForTablesDeleteText,
                  }}
                >
                  Delete Selected Devices
                </Option>
                <Option
                  value="deleteLabel"
                  style={{ color: redForTablesDeleteText }}
                >
                  Delete This Label
                </Option>
              </Select>
            </UserCan>
          </div>
        </div>
        <Table
          columns={columns}
          dataSource={devices_by_label.entries}
          rowKey={(record) => record.id}
          pagination={false}
          rowSelection={rowSelection}
          onChange={this.handleSortChange}
          style={{ minWidth }}
          onRow={(record, rowIndex) => ({
            onClick: (e) => {
              if (e.target.tagName === "TD") {
                this.props.history.push(`/devices/${record.id}`);
              }
            },
          })}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            paddingBottom: 0,
            minWidth,
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

        <DeleteLabelModal
          open={this.state.showDeleteLabelModal}
          onClose={() => this.setState({ showDeleteLabelModal: false })}
          labelId={this.props.labelId}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    socket: state.apollo.socket,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ updateDevice, setDevicesActive }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  withGql(LabelShowTable, PAGINATED_DEVICES_BY_LABEL, (props) => ({
    fetchPolicy: "cache-first",
    variables: {
      page: 1,
      pageSize: 10,
      labelId: props.labelId,
      column: DEFAULT_COLUMN,
      order: DEFAULT_ORDER,
    },
    name: "paginatedDevicesQuery",
  }))
);
