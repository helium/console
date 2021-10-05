import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQuery } from "@apollo/client";
import {
  addConfigProfileToNode,
  removeConfigProfileFromNode,
} from "../../../actions/configProfile";
import { ALL_CONFIG_PROFILES } from "../../../graphql/configProfiles";
import { SkeletonLayout } from "../../common/SkeletonLayout";
import { Switch, Typography, Table, Button } from "antd";
import { Link } from "react-router-dom";
import UserCan, { userCan } from "../../common/UserCan";
import analyticsLogger from "../../../util/analyticsLogger";
const { Text } = Typography;
import NewConfigProfileWithNode from "./NewConfigProfileWithNode";
import SlidersOutlined from "@ant-design/icons/SlidersOutlined";

export default ({ currentNode, nodeType }) => {
  const [showNew, setShowNew] = useState(false);
  const currentRole = useSelector((state) => state.organization.currentRole);
  const dispatch = useDispatch();
  const socket = useSelector((state) => state.apollo.socket);
  const configProfilesChannel = socket.channel(
    "graphql:config_profiles_index_table",
    {}
  );
  const currentOrganizationId = useSelector(
    (state) => state.organization.currentOrganizationId
  );

  const { loading, error, data, refetch } = useQuery(ALL_CONFIG_PROFILES, {
    fetchPolicy: "cache-first",
  });

  useEffect(() => {
    // executed when mounted
    configProfilesChannel.join();
    configProfilesChannel.on(
      `graphql:config_profiles_index_table:${currentOrganizationId}:config_profile_list_update`,
      (_message) => {
        refetch();
      }
    );

    // executed when unmounted
    return () => {
      configProfilesChannel.leave();
    };
  });

  if (loading)
    return (
      <div style={{ padding: "20px 40px 0px 40px" }}>
        <SkeletonLayout />
      </div>
    );
  if (error)
    return (
      <div style={{ padding: "20px 40px 0px 40px" }}>
        <Text>Data failed to load, please reload the page and try again</Text>
      </div>
    );

  return showNew ? (
    <NewConfigProfileWithNode
      nodeId={currentNode.id}
      nodeType={nodeType}
      back={() => {
        setShowNew(false);
      }}
    />
  ) : (
    <div>
      <Table
        dataSource={data.allConfigProfiles}
        rowKey={(record) => record.id}
        pagination={false}
        columns={[
          {
            title: "",
            dataIndex: "name",
            render: (data, record) => (
              <Link to={`/config_profiles/${record.id}`}>{data}</Link>
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
                  checked={currentNode.config_profile_id === record.id}
                  onChange={(checked) => {
                    if (checked) {
                      analyticsLogger.logEvent(
                        "ACTION_ADD_CONFIG_PROFILE_TO_NODE",
                        {
                          id: record.id,
                          nodeId: currentNode.id,
                          nodeType,
                        }
                      );
                      dispatch(
                        addConfigProfileToNode(
                          record.id,
                          currentNode.id,
                          nodeType
                        )
                      );
                    } else {
                      analyticsLogger.logEvent(
                        "ACTION_REMOVE_CONFIG_PROFILE_FROM_NODE",
                        {
                          id: record.id,
                          nodeId: currentNode.id,
                          nodeType,
                        }
                      );
                      dispatch(
                        removeConfigProfileFromNode(currentNode.id, nodeType)
                      );
                    }
                  }}
                />
              </div>
            ),
          },
        ]}
      />
      <UserCan>
        <Button
          style={{ borderRadius: 4, margin: 40 }}
          onClick={() => {
            setShowNew(true);
          }}
          icon={<SlidersOutlined />}
        >
          Create New Profile
        </Button>
      </UserCan>
    </div>
  );
};
