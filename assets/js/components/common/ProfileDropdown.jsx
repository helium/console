import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import DownOutlined from "@ant-design/icons/DownOutlined";
import { Dropdown, Menu, Button } from "antd";
import { useQuery } from "@apollo/client";
import { ALL_CONFIG_PROFILES } from "../../graphql/configProfiles";

export default (props) => {
  const [profileId, setProfileId] = useState(null);

  const { data, refetch } = useQuery(ALL_CONFIG_PROFILES, {
    fetchPolicy: "cache-first",
  });
  const profiles = data ? data.allConfigProfiles : [];
  const profilesMap = profiles.reduce((map, profile) => {
    map[profile.id] = profile;
    return map;
  }, {});

  const socket = useSelector((state) => state.apollo.socket);
  const currentOrganizationId = useSelector(
    (state) => state.organization.currentOrganizationId
  );
  const configProfilesChannel = socket.channel(
    "graphql:config_profiles_index_table",
    {}
  );
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
  }, []);

  useEffect(() => {
    if (props.profileId) setProfileId(props.profileId);
  }, [props.profileId]);

  useEffect(() => {
    props.selectProfile(profileId);
  }, [profileId]);

  const profileMenu = () => (
    <Menu
      onClick={(e) => {
        if (e.key === "none") {
          setProfileId(null);
        } else {
          setProfileId(e.key);
        }
      }}
    >
      <Menu.Item key={"none"}>
        <i>(None)</i>
      </Menu.Item>
      {profiles.map((p) => (
        <Menu.Item key={p.id}>{p.name}</Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Dropdown disabled={props.disabled} overlay={profileMenu()}>
      <Button style={{ marginRight: 5 }}>
        {profileId &&
        Object.keys(profilesMap).length > 0 &&
        profilesMap[profileId]
          ? profilesMap[profileId].name
          : "Select a profile"}
        <DownOutlined />
      </Button>
    </Dropdown>
  );
};
