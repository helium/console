import React from "react";
import { Typography } from "antd";
const { Text } = Typography;

export default ({ id, mainTitle, subtext, rightAction, onClick }) => {
  return (
    <div
      key={id}
      onClick={onClick}
      style={{
        padding: "10px 15px 10px 15px",
        backgroundColor: "#ffffff",
        marginBottom: 4,
        borderRadius: 4,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: 600,
            ...(onClick && { color: "#2C79EE" }),
          }}
        >
          {mainTitle}
        </Text>
        <Text style={{ color: "#88A8C6", fontSize: 14 }}>{subtext}</Text>
      </div>
      {rightAction}
    </div>
  );
};
