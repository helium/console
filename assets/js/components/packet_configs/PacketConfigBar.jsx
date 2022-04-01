import React from "react";
import NavPointTriangle from "../common/NavPointTriangle";
import { Typography } from "antd";
const { Text } = Typography;
import { Link } from "react-router-dom";

const PacketConfigButton = ({ id, name, selected }) => (
  <React.Fragment>
    <Link to={`/packets/${id}`}>
      <div
        style={{
          position: "relative",
          background: selected ? "#3C6B95" : "#2C79EE",
          marginRight: 10,
          marginRight: "10px",
          width: "140px",
          padding: "5px 10px",
          height: "50px",
          borderRadius: 25,
          textAlign: "center",
          lineHeight: "150%",
        }}
      >
        <div
          style={{
            width: "120px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            color: "white",
            textAlign: "center",
          }}
        >
          <Text style={{ color: "white", fontSize: 14, fontWeight: 500 }}>
            {name}
          </Text>
        </div>
        <Text style={{ color: "white", fontSize: 12 }}>Packet Config</Text>
        {selected && <NavPointTriangle />}
      </div>
    </Link>
  </React.Fragment>
);

export default ({ packetConfigs, shownPacketConfigId }) => {
  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      {packetConfigs.map((m) => (
        <PacketConfigButton
          key={m.id}
          id={m.id}
          name={m.name}
          selected={m.id === shownPacketConfigId}
        />
      ))}
    </div>
  );
};
