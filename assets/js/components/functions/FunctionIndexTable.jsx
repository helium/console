import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Link } from "react-router-dom";
import UserCan, { userCan } from "../common/UserCan";
import { updateFunction } from "../../actions/function";
import analyticsLogger from "../../util/analyticsLogger";
import { minWidth } from "../../util/constants";
import {
  Table,
  Button,
  Pagination,
  Switch,
  Typography,
  Popover,
  Tooltip,
} from "antd";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
const { Text } = Typography;

const functionFormats = {
  cayenne: "Cayenne LPP",
  browan_object_locator: "Browan Object Locator",
  custom: "Custom",
};

class FunctionIndexTable extends Component {
  render() {
    const columns = [
      {
        title: "Name",
        dataIndex: "name",
        render: (text, record) => (
          <Link to={`/functions/${record.id}`}>{text}</Link>
        ),
      },
      {
        title: "Type",
        dataIndex: "format",
        render: (text) => functionFormats[text],
      },
      {
        title: "",
        dataIndex: "active",
        render: (text, record) => (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >

            <Popover
              content={`This function is currently ${
                record.active ? "active" : "inactive"
              }`}
              placement="top"
              overlayStyle={{ width: 140 }}
            >
              <Switch
                checked={record.active}
                onChange={(value, e) => {
                  e.stopPropagation();
                  this.props.updateFunction(record.id, {
                    active: !record.active,
                  });
                  analyticsLogger.logEvent("ACTION_UPDATE_FUNCTION_ACTIVE", {
                    id: record.id,
                    active: !record.active,
                  });
                }}
                disabled={!userCan({ role: this.props.currentRole })}
              />
            </Popover>
            <UserCan>
              <Tooltip title="Delete Function">
                <Button
                  type="danger"
                  icon={<DeleteOutlined />}
                  shape="circle"
                  size="small"
                  style={{ marginLeft: 10 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    this.props.openDeleteFunctionModal(record);
                  }}
                />
              </Tooltip>
            </UserCan>
          </div>
        ),
      },
    ];

    const { functions } = this.props;

    return (
      <div className="no-scroll-bar" style={{ overflowX: "scroll" }}>
        <div
          style={{
            minWidth,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            padding: "30px 20px 20px 30px",
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: 600 }}>All Functions</Text>
        </div>
        <Table
          columns={columns}
          dataSource={functions.entries}
          rowKey={(record) => record.id}
          pagination={false}
          style={{ minWidth, overflowX: "scroll", overflowY: "hidden" }}
          onRow={(record, rowIndex) => ({
            onClick: (e) => {
              if (e.target.tagName === "TD") {
                this.props.history.push(`/functions/${record.id}`);
              }
            },
          })}
        />
        <div
          style={{
            minWidth,
            display: "flex",
            justifyContent: "flex-end",
            paddingBottom: 0,
          }}
        >
          <Pagination
            current={functions.pageNumber}
            pageSize={functions.pageSize}
            total={functions.totalEntries}
            onChange={(page) => this.props.handleChangePage(page)}
            style={{ marginBottom: 20 }}
            showSizeChanger={false}
          />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    currentRole: state.organization.currentRole
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ updateFunction }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(FunctionIndexTable);
