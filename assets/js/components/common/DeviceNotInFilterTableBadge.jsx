import React from "react";
import { Tooltip, Tag } from "antd";
import inXORFilterDeviceTag from "../../../img/in_xor_filter/in-xor-filter-device-table-tag.svg";

export default () => {
  return (
    <Tooltip title="Device not yet in XOR filter">
      <Tag
        style={{
          marginLeft: 10,
          padding: 5,
          backgroundColor: "transparent",
          color: "#2C79EE",
          borderColor: "#2C79EE",
          borderRadius: 33,
          borderWidth: 1,
        }}
        icon={
          <img
            src={inXORFilterDeviceTag}
            style={{ height: 14, marginRight: 5 }}
          />
        }
      >
        Pending...
      </Tag>
    </Tooltip>
  );
};
