import React, { useEffect } from "react";
import { Typography, Row, Col } from "antd";
const { Text } = Typography;
import HeaderFlag from "../../../img/coverage/followed-tab-header-flag.svg";

export default (props) => {
  return (
    <div>
      <div style={{ padding: 25, paddingTop: 8 }}>
        <img
          draggable="false"
          src={HeaderFlag}
          style={{
            height: 32,
            width: 32,
            marginBottom: 6
          }}
        />
        <div style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 22, fontWeight: 600 }}>My Hotspots</Text>
        </div>
        <Row gutter={24}>
          <Col sm={12}>
            <Text style={{ fontSize: 15 }}>
              Hotspots that have been 'claimed' appear in the list below.
            </Text>
          </Col>
        </Row>
      </div>
    </div>
  );
};
