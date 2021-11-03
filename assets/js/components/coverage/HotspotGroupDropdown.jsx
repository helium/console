import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { Popover, Button, Space } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  addHotspotToGroup,
  removeHotspotFromGroup,
} from "../../actions/coverage";
import { ALL_HOTSPOT_GROUPS } from "../../graphql/coverage";
import Text from "antd/lib/typography/Text";
import GroupMenuItem from "./GroupMenuItem";
import DeleteGroupModal from "./DeleteGroupModal";
import NewGroupMenuItem from "./NewGroupMenuItem";

export default ({ appliedGroups, hotspotId }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const dispatch = useDispatch();
  const { loading, error, data, refetch } = useQuery(ALL_HOTSPOT_GROUPS, {
    fetchPolicy: "cache-first",
  });

  const groups = data ? data.allGroups : [];

  const socket = useSelector((state) => state.apollo.socket);
  const currentOrganizationId = useSelector(
    (state) => state.organization.currentOrganizationId
  );
  const groupsChannel = socket.channel("graphql:groups_index", {});

  useEffect(() => {
    // executed when mounted
    groupsChannel.join();
    groupsChannel.on(
      `graphql:groups_index:${currentOrganizationId}:org_groups_update`,
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
      dispatch(removeHotspotFromGroup(hotspotId, groupId));
    } else {
      dispatch(addHotspotToGroup(hotspotId, groupId));
    }
  };

  const content = (
    <div>
      {groups.map((group) => {
        const isGroupSelected = !!appliedGroups.find(
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
      <NewGroupMenuItem />
    </div>
  );

  if (!loading && data) {
    return (
      <>
        <Popover
          destroyTooltipOnHide={true}
          content={content}
          // visible={true}
          overlayClassName="hotspot-group-menu"
          placement="right"
          key={`group-popover-${hotspotId}`}
        >
          <Button type="text" style={{ background: "none" }}>
            <Space>
              {appliedGroups.length > 0 ? (
                appliedGroups.map((groupId, index) => {
                  let group = groups.find((g) => g.id === groupId);
                  if (index + 1 === appliedGroups.length) {
                    return <Text key={`group-${group.id}`}>{group.name}</Text>;
                  } else {
                    return (
                      <Text key={`group-${group.id}`}>{group.name + ","}</Text>
                    );
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
