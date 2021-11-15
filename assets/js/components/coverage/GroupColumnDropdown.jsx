import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { Popover, Button, Space } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  addHotspotToGroup,
  removeHotspotFromGroup,
} from "../../actions/coverage";
import { ALL_GROUPS } from "../../graphql/coverage";
import Text from "antd/lib/typography/Text";
import GroupMenuItem from "./GroupMenuItem";
import DeleteGroupModal from "./DeleteGroupModal";
import NewGroupMenuItem from "./NewGroupMenuItem";
import analyticsLogger from "../../util/analyticsLogger";
import UserCan from "../common/UserCan";

export default ({ appliedGroups, hotspotId }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const dispatch = useDispatch();
  const { loading, error, data, refetch } = useQuery(ALL_GROUPS, {
    fetchPolicy: "cache-first",
  });

  const groups = data ? data.allGroups : [];

  const socket = useSelector((state) => state.apollo.socket);
  const currentOrganizationId = useSelector(
    (state) => state.organization.currentOrganizationId
  );
  const groupsChannel = socket.channel("graphql:followed_hotspots_groups", {});

  useEffect(() => {
    // executed when mounted
    groupsChannel.join();
    groupsChannel.on(
      `graphql:followed_hotspots_groups:${currentOrganizationId}:org_groups_update`,
      (_message) => {
        refetch();
      }
    );

    // executed when unmounted
    return () => {
      groupsChannel.leave();
    };
  }, []);

  const handleClick = (hotspotId, groupId, currentlySelected) => {
    if (currentlySelected) {
      dispatch(removeHotspotFromGroup(hotspotId, groupId)).then(() => {
        analyticsLogger.logEvent("ACTION_REMOVE_HOTSPOT_FROM_GROUP", {
          group_id: groupId,
          hotspot_id: hotspotId,
        });
      });
    } else {
      dispatch(addHotspotToGroup(hotspotId, groupId)).then(() => {
        analyticsLogger.logEvent("ACTION_ADD_HOTSPOT_TO_GROUP", {
          group_id: groupId,
          hotspot_id: hotspotId,
        });
      });
    }
  };

  const content = (
    <div style={{ maxHeight: 300, overflowY: "scroll" }}>
      {groups.map((group) => {
        const isGroupSelected = !!(appliedGroups || []).find(
          (groupId) => groupId === group.id
        );
        return (
          <GroupMenuItem
            group={group}
            handleClick={handleClick}
            hotspotId={hotspotId}
            isGroupSelected={isGroupSelected}
            activateDeleteModal={() => {
              setShowDeleteModal(true);
              setGroupToDelete(group);
            }}
            key={`group-option-${group.id}`}
          />
        );
      })}
      <UserCan>
        <NewGroupMenuItem />
      </UserCan>
    </div>
  );

  if (!loading && data) {
    return (
      <>
        <Popover
          destroyTooltipOnHide={true}
          content={content}
          overlayClassName="hotspot-group-menu"
          placement="right"
          key={`group-popover-${hotspotId}`}
        >
          <Button type="text" style={{ padding: 0, background: "none" }}>
            <Space>
              {appliedGroups && appliedGroups.length > 0 ? (
                appliedGroups.map((groupId, index) => {
                  let group = groups.find((g) => g.id === groupId);
                  if (group) {
                    if (index + 1 === appliedGroups.length) {
                      return (
                        <Text key={`group-${group.id}`}>{group.name}</Text>
                      );
                    } else {
                      return (
                        <Text key={`group-${group.id}`}>
                          {group.name + ","}
                        </Text>
                      );
                    }
                  }
                })
              ) : (
                <Text style={{ color: "grey" }}>Add to Group...</Text>
              )}
            </Space>
          </Button>
        </Popover>
        <DeleteGroupModal
          show={showDeleteModal}
          group={groupToDelete}
          close={() => {
            setShowDeleteModal(false);
          }}
        />
      </>
    );
  } else {
    return <i>None</i>;
  }
};
