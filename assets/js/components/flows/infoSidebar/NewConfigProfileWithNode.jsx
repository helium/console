import React from "react";
import { useDispatch } from "react-redux";
import Text from "antd/lib/typography/Text";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import {
  createConfigProfile,
  addConfigProfileToNode,
} from "../../../actions/configProfile";
import analyticsLogger from "../../../util/analyticsLogger";
import ConfigProfileSettings from "../../config_profiles/ConfigProfileSettings";

export default (props) => {
  const dispatch = useDispatch();
  return (
    <div style={{ padding: "0px 40px 0px 40px" }}>
      <Text
        style={{ display: "block", fontSize: "20px", marginBottom: 5 }}
        strong
      >
        Create New Profile
      </Text>
      <ConfigProfileSettings
        save={({ adrAllowed, cfListEnabled, name }) => {
          analyticsLogger.logEvent("ACTION_CREATE_CONFIG_PROFILE", {
            name: name,
            adr_allowed: adrAllowed,
            cf_list_enabled: cfListEnabled,
          });
          dispatch(
            createConfigProfile({
              name: name,
              adr_allowed: adrAllowed,
              cf_list_enabled: cfListEnabled,
            })
          )
            .then((data) => {
              analyticsLogger.logEvent("ACTION_ADD_CONFIG_PROFILE_TO_NODE", {
                configProfileId: data.data.id,
                nodeId: props.nodeId,
                nodeType: props.nodeType,
              });
              return dispatch(
                addConfigProfileToNode(
                  data.data.id,
                  props.nodeId,
                  props.nodeType
                )
              );
            })
            .then(() => {
              props.back();
            });
        }}
        back={props.back}
        saveIcon={<PlusOutlined />}
        cancel
      />
    </div>
  );
};
