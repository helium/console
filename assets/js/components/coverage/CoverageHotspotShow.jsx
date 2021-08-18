import React, { useEffect } from "react";
import { Typography, Row, Col } from "antd";
const { Text } = Typography;

export default (props) => {
  return (
    <div style={{ padding: 25}}>
      <div style={{ marginBottom: 8 }}>
        <Text style={{ fontSize: 22, fontWeight: 600 }}>{props.hotspotAddress}</Text>
      </div>


    </div>
  );
};
