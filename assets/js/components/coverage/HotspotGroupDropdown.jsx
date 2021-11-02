import React from "react";
import { useQuery } from "@apollo/client";
import { Menu, Dropdown } from "antd";
import { ALL_HOTSPOT_GROUPS } from "../../graphql/coverage";
import Text from "antd/lib/typography/Text";

export default ({ appliedGroups }) => {
  const { loading, error, data, refetch } = useQuery(ALL_HOTSPOT_GROUPS, {
    fetchPolicy: "cache-first",
  });

  const groups = data ? data.allGroups : [];
  const menu = (
    <Menu selectable={false}>
      {groups.map((g) => (
        <Menu.Item>{g.name}</Menu.Item>
      ))}
    </Menu>
  );

  if (!loading && data) {
    return (
      <Dropdown overlay={menu}>
        <Text>
          {appliedGroups.map((groupId, index) => {
            let group = groups.find((g) => g.id === groupId);
            if (index + 1 === appliedGroups.length) {
              return group.name;
            } else {
              return group.name + ", ";
            }
          })}
        </Text>
      </Dropdown>
    );
  } else {
    return <i>None</i>;
  }
};
