import React from "react";
import { Link } from "react-router-dom";
import { Table, Button, Tooltip } from "antd";
import Text from "antd/lib/typography/Text";
import { minWidth } from "../../util/constants";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import UserCan from "../common/UserCan";

export default (props) => {
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      render: (data, record) => (
        <Link to={`/config_profiles/${record.id}`}>{data}</Link>
      ),
    },
    {
      title: "ADR Allowed",
      dataIndex: "adr_allowed",
    },
    {
      title: "CF List Enabled",
      dataIndex: "cf_list_enabled",
    },
    {
      title: "",
      dataIndex: "",
      render: () => (
        <UserCan>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <Tooltip title="Delete Profile">
              <Button
                type="danger"
                icon={<DeleteOutlined />}
                shape="circle"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  // props.openDeleteMultiplePacketModal(record);
                }}
              />
            </Tooltip>
          </div>
        </UserCan>
      ),
    },
  ];

  return (
    <div className="no-scroll-bar" style={{ overflowX: "scroll" }}>
      <div style={{ padding: "30px 20px 20px 30px", minWidth }}>
        <Text style={{ fontSize: 22, fontWeight: 600 }}>
          All Config Profiles
        </Text>
      </div>
      <Table
        dataSource={props.data}
        columns={columns}
        rowKey={(record) => record.id}
        pagination={false}
        style={{ minWidth, overflowX: "scroll", overflowY: "hidden" }}
        onRow={(record, rowIndex) => ({
          onClick: (e) => {
            if (e.target.tagName === "TD") {
              props.history.push(`/config_profiles/${record.id}`);
            }
          },
        })}
      />
    </div>
  );
};
