import React from "react";
import { Typography } from "antd";
const { Text } = Typography;

export default ({ id, mainTitle, subtext, rightAction, onClick, borderTop, borderBottom }) => {
  return (
    <div
      key={id}
      onClick={onClick}
      style={{
        padding: "10px 15px 10px 15px",
        backgroundColor: "#ffffff",
        marginBottom: borderBottom ? 0 : 4,
        borderRadius: 4,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderTop: borderTop ? "2px solid #F5F7F9" : "none",
        borderBottom: borderBottom ? "2px solid #F5F7F9" : "none"
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
