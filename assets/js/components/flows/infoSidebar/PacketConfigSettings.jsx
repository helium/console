import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQuery } from "@apollo/client";
import {
  addPacketConfigToNode,
  removePacketConfigFromNode,
} from "../../../actions/packetConfig";
import { ALL_PACKET_CONFIGS } from "../../../graphql/packetConfigs";
import { SkeletonLayout } from "../../common/SkeletonLayout";
import { Switch, Table } from "antd";
import { Link } from "react-router-dom";
import { userCan } from "../../common/UserCan";
import analyticsLogger from "../../../util/analyticsLogger";
import ErrorMessage from "../../common/ErrorMessage";

export default ({ currentNode }) => {
  const currentRole = useSelector((state) => state.organization.currentRole);
  const dispatch = useDispatch();

  const { loading, error, data } = useQuery(ALL_PACKET_CONFIGS, {
    fetchPolicy: "cache-first",
  });
  if (loading)
    return (
      <div style={{ padding: "20px 40px 0px 40px" }}>
        <SkeletonLayout />
      </div>
    );
  if (error) return <ErrorMessage />;

  return (
    <div>
      <Table
        dataSource={data.allPacketConfigs}
        rowKey={(record) => record.id}
        pagination={false}
        columns={[
          {
            title: "",
            dataIndex: "name",
            render: (data, record) => (
              <Link to={`/packets/${record.id}`}>{data}</Link>
            ),
          },
          {
            title: "",
            dataIndex: "",
            render: (text, record) => (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              >
                <Switch
                  disabled={!userCan({ role: currentRole })}
                  checked={currentNode.packet_config_id === record.id}
                  onChange={(checked) => {
                    if (checked) {
                      analyticsLogger.logEvent(
                        "ACTION_ADD_PACKET_CONFIG_TO_NODE",
                        {
                          id: record.id,
                          nodeId: currentNode.id,
                          nodeType: currentNode.__typename,
                        }
                      );
                      dispatch(
                        addPacketConfigToNode(
                          record.id,
                          currentNode.id,
                          currentNode.__typename
                        )
                      );
                    } else {
                      analyticsLogger.logEvent(
                        "ACTION_REMOVE_PACKET_CONFIG_FROM_NODE",
                        {
                          id: record.id,
                          nodeId: currentNode.id,
                          nodeType: currentNode.__typename,
                        }
                      );
                      dispatch(
                        removePacketConfigFromNode(
                          currentNode.id,
                          currentNode.__typename
                        )
                      );
                    }
                  }}
                />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};
