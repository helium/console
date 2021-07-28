import React from "react";
import { Tooltip } from "antd";
import inXORFilterLabelTag from "../../../img/in_xor_filter/in-xor-filter-label-tag.svg";

export default () => {
  return (
    <Tooltip title="One or more devices in this label not yet in XOR filter">
      <img
        draggable="false"
        src={inXORFilterLabelTag}
        style={{
          top: "-11px",
          left: "-11px",
          position: "absolute",
        }}
      />
    </Tooltip>
  );
};
