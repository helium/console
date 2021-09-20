import React from "react";
import Text from "antd/lib/typography/Text";

export default ({ warningText }) => {
  return (
    <div
      style={{
        backgroundColor: "rgba(241, 143, 71, 0.15)",
        margin: "5px 0 15px 0",
        padding: 20,
        borderRadius: 10,
      }}
    >
      <Text style={{ fontSize: 16 }}>{warningText}</Text>
    </div>
  );
};
