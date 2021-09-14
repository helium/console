import React from 'react';
import { Typography, Spin } from "antd";
const { Text } = Typography;

export default ({ hasChanges }) => {
  if (hasChanges) {
    return (
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        zIndex: 150,
        padding: 10,
        backgroundColor: "#ffffff",
        borderRadius: 6,
        boxShadow: "0px 20px 20px -7px rgba(17, 24, 31, 0.19)",
      }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <Spin size="small" style={{ marginRight: 10, height: 16 }} />
          <Text>Autosaving Changes</Text>
        </div>
      </div>
    )
  } else return <div />
};
