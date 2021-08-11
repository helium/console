import React, { useEffect } from "react";
import { Typography, Row, Col } from "antd";
const { Text } = Typography;
import SearchOutlined from "@ant-design/icons/SearchOutlined";
import SelectedFlag from "../../../img/coverage/selected-flag.svg";

export default (props) => {
  return (
    <div>
      <div style={{ padding: 25}}>
        <div style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 22, fontWeight: 600 }}>Hotspot Search</Text>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            background: '#F5F7F9',
            borderRadius: 4,
            padding: "4px 16px 4px 16px",
            marginBottom: 32,
          }}
        >
          <SearchOutlined style={{ color: "#8B9FC1", fontSize: 16 }} />
          <input
            style={{
              background: 'none',
              border: 'none',
              color: '#8B9FC1',
              fontSize: 15,
              lineHeight: 24,
              marginLeft: 10,
              height: 28,
              width: '90%'
            }}
          />
        </div>

        <Row gutter={24}>
          <Col sm={12}>
            <Text style={{ fontSize: 16, fontWeight: 600 }}>Recent Searches</Text>
          </Col>
          <Col sm={12}>
            <div style={{ marginBottom: 4 }}>
              <img
                draggable="false"
                src={SelectedFlag}
                style={{
                  height: 16,
                  marginRight: 10
                }}
              />
              <Text style={{ fontSize: 16, fontWeight: 600 }}>Flag to Mark</Text>
            </div>
            <Text>
              Any Hotspot in the network can be flagged, which adds it to your Organization's 'My Hotspots' tab.
            </Text>
          </Col>
        </Row>
      </div>
    </div>
  );
};
