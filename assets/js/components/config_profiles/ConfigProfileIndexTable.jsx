import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Table, Button, Tooltip, Switch } from "antd";
import Text from "antd/lib/typography/Text";
import { minWidth } from "../../util/constants";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import UserCan, { userCan } from "../common/UserCan";
import { updateConfigProfile } from "../../actions/configProfile";

export default (props) => {
  const dispatch = useDispatch();
  const currentRole = useSelector((state) => state.organization.currentRole);
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
      render: (data, record) => (
        <Switch
          onChange={(checked) => {
            dispatch(updateConfigProfile(record.id, { adr_allowed: checked }));
          }}
          checked={record.adr_allowed}
          style={{ marginRight: 8 }}
          disabled={!userCan({ role: currentRole })}
        />
      ),
    },
    {
      title: "CF List Enabled",
      dataIndex: "cf_list_enabled",
      render: (data, record) => (
        <Switch
          onChange={(checked) => {
            dispatch(
              updateConfigProfile(record.id, { cf_list_enabled: checked })
            );
          }}
          checked={record.cf_list_enabled}
          style={{ marginRight: 8 }}
          disabled={!userCan({ role: currentRole })}
        />
      ),
    },
    {
      title: "",
      dataIndex: "",
      render: (_text, record) => (
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
                  props.openDeleteConfigProfileModal(record);
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
        <Text style={{ fontSize: 22, fontWeight: 600 }}>All Profiles</Text>
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
