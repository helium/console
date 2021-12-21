import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQuery } from "@apollo/client";
import {
  addMultiBuyToNode,
  removeMultiBuyFromNode,
} from "../../../actions/multiBuy";
import { ALL_MULTI_BUYS } from "../../../graphql/multiBuys";
import { SkeletonLayout } from "../../common/SkeletonLayout";
import { Switch, Table } from "antd";
import { Link } from "react-router-dom";
import { userCan } from "../../common/UserCan";
import analyticsLogger from "../../../util/analyticsLogger";
import ErrorMessage from "../../common/ErrorMessage";

export default ({ currentNode }) => {
  const currentRole = useSelector((state) => state.organization.currentRole);
  const dispatch = useDispatch();

  const { loading, error, data } = useQuery(ALL_MULTI_BUYS, {
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
        dataSource={data.allMultiBuys}
        rowKey={(record) => record.id}
        pagination={false}
        columns={[
          {
            title: "",
            dataIndex: "name",
            render: (data, record) => (
              <Link to={`/multi_buys/${record.id}`}>{data}</Link>
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
                  checked={currentNode.multi_buy_id === record.id}
                  onChange={(checked) => {
                    if (checked) {
                      analyticsLogger.logEvent("ACTION_ADD_MULTIBUY_TO_NODE", {
                        id: record.id,
                        nodeId: currentNode.id,
                        nodeType: currentNode.__typename,
                      });
                      dispatch(
                        addMultiBuyToNode(
                          record.id,
                          currentNode.id,
                          currentNode.__typename
                        )
                      );
                    } else {
                      analyticsLogger.logEvent(
                        "ACTION_REMOVE_MULTIBUY_FROM_NODE",
                        {
                          id: record.id,
                          nodeId: currentNode.id,
                          nodeType: currentNode.__typename,
                        }
                      );
                      dispatch(
                        removeMultiBuyFromNode(
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
