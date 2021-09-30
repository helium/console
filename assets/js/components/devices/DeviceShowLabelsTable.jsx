import React, { Component } from "react";
import withGql from "../../graphql/withGql";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import moment from "moment";
import LabelTag from "../common/LabelTag";
import UserCan from "../common/UserCan";
import { history } from "../../store/configureStore";
import { minWidth } from "../../util/constants";
import { PAGINATED_LABELS_BY_DEVICE } from "../../graphql/labels";
import { Card, Button, Typography, Table, Pagination, Tooltip } from "antd";
import CloseOutlined from "@ant-design/icons/CloseOutlined";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import { SkeletonLayout } from "../common/SkeletonLayout";
const { Text } = Typography;
const DEFAULT_COLUMN = "name";
const DEFAULT_ORDER = "asc";

class DeviceShowLabelsTable extends Component {
  state = {
    page: 1,
    pageSize: 10,
    selectedRows: [],
    column: DEFAULT_COLUMN,
    order: DEFAULT_ORDER,
  };

  componentDidMount() {
    const { deviceId, socket } = this.props;

    this.channel = socket.channel("graphql:device_show_labels_table", {});
    this.channel.join();
    this.channel.on(
      `graphql:device_show_labels_table:${deviceId}:device_update`,
      (message) => {
        const { page, pageSize, column, order } = this.state;
        this.refetchPaginatedEntries(page, pageSize, column, order);
      }
    );
  }

  componentWillUnmount() {
    this.channel.leave();
  }

  handleChangePage = (page) => {
    this.setState({ page });

    const { pageSize, column, order } = this.state;
    this.refetchPaginatedEntries(page, pageSize, column, order);
  };

  refetchPaginatedEntries = (page, pageSize, column, order) => {
    const { refetch } = this.props.paginatedLabelsQuery;
    refetch({ page, pageSize, column, order });
  };

  render() {
    const columns = [
      {
        title: "Label",
        dataIndex: "name",
        render: (text, record) => (
          <Link to={`/labels/${record.id}`}>
            {text} <LabelTag text={text} style={{ marginLeft: 10 }} />
          </Link>
        ),
      },
      {
        title: "Date Activated",
        dataIndex: "inserted_at",
        render: (data) => moment.utc(data).local().format("lll"),
      },
      {
        title: "",
        key: "action",
        render: (text, record) => (
          <div>
            <UserCan>
              <Tooltip title="Remove Label">
                <Button
                  type="danger"
                  icon={<CloseOutlined />}
                  shape="circle"
                  size="small"
                  style={{ marginLeft: 8 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    this.props.openRemoveLabelFromDeviceModal([record]);
                  }}
                />
              </Tooltip>
            </UserCan>
          </div>
        ),
      },
    ];

    const { loading, error, labels_by_device } =
      this.props.paginatedLabelsQuery;
    const numOfEntries = labels_by_device && labels_by_device.totalEntries;

    if (loading) return <SkeletonLayout />;
    if (error)
      return (
        <Text>Data failed to load, please reload the page and try again</Text>
      );

    return (
      <Card
        bodyStyle={{ padding: 0, paddingTop: 1 }}
        title={`${numOfEntries} Label${
          numOfEntries > 1 || numOfEntries === 0 ? "s" : ""
        } Attached`}
        extra={
          <UserCan>
            <Button
              type="primary"
              onClick={this.props.openDevicesAddLabelModal}
              icon={<PlusOutlined />}
            >
              Add Label
            </Button>
          </UserCan>
        }
      >
        {labels_by_device && labels_by_device.entries.length > 0 && (
          <div className="no-scroll-bar" style={{ overflowX: "scroll" }}>
            <Table
              columns={
                this.props.from === "deviceFlowsSidebar"
                  ? columns.filter((c) => c.dataIndex !== "inserted_at")
                  : columns
              }
              dataSource={labels_by_device.entries}
              rowKey={(record) => record.id}
              pagination={false}
              style={{
                minWidth:
                  this.props.from === "deviceFlowsSidebar" ? 150 : minWidth,
              }}
              onRow={(record, rowIndex) => ({
                onClick: (e) => {
                  if (e.target.tagName === "TD") {
                    history.push(`/labels/${record.id}`);
                  }
                },
              })}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                paddingBottom: 0,
                minWidth:
                  this.props.from === "deviceFlowsSidebar" ? 150 : minWidth,
              }}
            >
              <Pagination
                current={labels_by_device.pageNumber}
                pageSize={labels_by_device.pageSize}
                total={labels_by_device.totalEntries}
                onChange={(page) => this.handleChangePage(page)}
                style={{ marginBottom: 20 }}
                showSizeChanger={false}
              />
            </div>
          </div>
        )}
      </Card>
    );
  }
}

function mapStateToProps(state) {
  return {
    socket: state.apollo.socket,
  };
}

export default connect(
  mapStateToProps,
  null
)(
  withGql(DeviceShowLabelsTable, PAGINATED_LABELS_BY_DEVICE, (props) => ({
    fetchPolicy: "cache-and-network",
    variables: {
      page: 1,
      pageSize: 10,
      deviceId: props.deviceId,
      column: DEFAULT_COLUMN,
      order: DEFAULT_ORDER,
    },
    name: "paginatedLabelsQuery",
  }))
);
