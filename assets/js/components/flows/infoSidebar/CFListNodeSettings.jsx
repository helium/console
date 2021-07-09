import React from "react";
import { useSelector } from "react-redux";
import { Switch, Typography } from "antd";
const { Text } = Typography;
import { userCan } from "../../common/UserCan";
import {
  cfListText1,
  cfListText2,
  cfListText3,
} from "../../cf_list/CFListIndex";

export default ({ checked, from, updateCFList }) => {
  const currentRole = useSelector((state) => state.organization.currentRole);
  return (
    <div style={{ marginBottom: 20 }}>
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
          Enable Join-Accept CF List (applicable to US915 devices only)
        </Text>
      </div>

      <div style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 14, display: "block", marginBottom: 4 }}>
          {cfListText1}
        </Text>
        <Text style={{ fontSize: 14, display: "block" }}>{cfListText2}</Text>
        <Text style={{ fontSize: 14, display: "block" }}>{cfListText3}</Text>
      </div>

      {from === "device" && (
        <Text strong style={{ fontSize: 16 }}>
          Note: If this device belongs to a label that has CF List enabled, CF
          List will be active on this device. If this device has CF List enabled, the label CF List setting will be ignored.
        </Text>
      )}
      {from === "label" && (
        <Text strong style={{ fontSize: 16 }}>
          Note: If this label has CF List enabled, all devices in this label
          will have CF List active as well.
        </Text>
      )}
    </div>
  );
};
