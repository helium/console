import React from "react";
import { useSelector } from "react-redux";
import { Switch, Typography } from "antd";
const { Text } = Typography;
import { userCan } from "../../common/UserCan";

export default ({ checked, from, updateCFList }) => {
  const currentRole = useSelector((state) => state.organization.currentRole);
  return (
    <div>
      <div
        style={{
          marginBottom: 20,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Switch
          onChange={(cfListValue) => updateCFList(cfListValue)}
          checked={checked}
          style={{ marginRight: 8 }}
          disabled={!userCan({ role: currentRole })}
        />
        <Text strong style={{ fontSize: 16 }}>
          Allow CF List (applicable to US915 devices only)
        </Text>
      </div>

      {from === "device" && (
        <Text strong style={{ fontSize: 16 }}>
          Note: If this device belongs to a label that has CF List enabled, CF
          List will be activated on this device.
        </Text>
      )}
      {from === "label" && (
        <Text strong style={{ fontSize: 16 }}>
          Note: If this label has CF List enabled, all CF List settings of the
          devices in this label will be ignored.
        </Text>
      )}
    </div>
  );
};
