import React from "react";
import { Link } from "react-router-dom";
import { Table, Button, Tooltip, Switch } from "antd";
import Text from "antd/lib/typography/Text";
import { minWidth } from "../../util/constants";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import UserCan from "../common/UserCan";
import { updatePacketConfig } from "../../actions/packetConfig";
import { useSelector, useDispatch } from "react-redux";
import { userCan } from "../common/UserCan";

export default (props) => {
  const dispatch = useDispatch();
  const currentRole = useSelector((state) => state.organization.currentRole);
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      render: (data, record) => (
        <Link to={`/packets/${record.id}`}>{data}</Link>
      ),
    },
    {
      title: "Preferred Hotspot(s)",
      dataIndex: "preferred_active",
      render: (data, record) => (
        <Switch
          checked={data}
          onChange={(active) =>
            dispatch(
              updatePacketConfig(record.id, {
                multiActive:
                  record.multi_active && active ? false : record.multi_active,
                preferredActive: active,
                multiBuyValue: record.multi_buy_value,
              })
            )
          }
          disabled={
            !userCan({ role: currentRole }) || !props.orgHasPreferredHotspots
          }
        />
      ),
    },
    {
      title: "Multiple Packets",
      dataIndex: "multi_active",
      render: (data, record) => (
        <>
          <Switch
            checked={data}
            onChange={(active) => {
              dispatch(
                updatePacketConfig(record.id, {
                  multiActive: active,
                  preferredActive:
                    record.preferred_active && active
                      ? false
                      : record.preferred_active,
                  multiBuyValue: record.multi_buy_value,
                })
              );
            }}
            disabled={!userCan({ role: currentRole })}
          />
          {data && (
            <Text style={{ marginLeft: 5 }}>
              Up to {record.multi_buy_value} packet
              {`${record.multi_buy_value > 1 ? "s" : ""}`}
            </Text>
          )}
        </>
      ),
    },
    {
      title: "",
      dataIndex: "",
      render: (text, record) => (
        <UserCan>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <Tooltip title="Delete Config">
              <Button
                type="danger"
                icon={<DeleteOutlined />}
                shape="circle"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  props.openDeletePacketConfigModal(record);
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
          All Packet Configurations
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
              props.history.push(`/packets/${record.id}`);
            }
          },
        })}
      />
    </div>
  );
};
