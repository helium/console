import React, { useEffect } from "react";
import { Link } from 'react-router-dom';
import { Typography, Row, Col } from "antd";
const { Text } = Typography;
import SelectedFlag from "../../../img/coverage/selected-flag.svg";

export default (props) => {
  return (
    <div>
      <div style={{ padding: 25 }}>
        <div style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 22, fontWeight: 600 }}>Device Coverage</Text>
        </div>
        <Row gutter={24}>
          <Col sm={12}>
            <div style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 15 }}>
                The hotspots listed below provided coverage for your
                <Link
                  to={"/devices"}
                  className="help-link"
                > # devices </Link>
                over the past 30 days.
              </Text>
            </div>
            <div>
              <a className="help-link">
                Learn More
              </a>
            </div>
          </Col>
          <Col sm={12}>
            <div style={{ backgroundColor: '#F5F7F9', borderRadius: 10, padding: 16 }}>
              <div style={{ marginBottom: 4 }}>
                <img
                  draggable="false"
                  src={SelectedFlag}
                  style={{
                    height: 18,
                    marginRight: 10
                  }}
                />
                <Text
                  style={{ fontWeight: 400, fontSize: 16, color: '#2C79EE'}}
                >
                  Claim to Follow
                </Text>
              </div>
              <div>
                <Text
                  style={{ color: '#2C79EE'}}
                >
                  Claiming a Hotspot allows you to mark which Hotspots are owned by your Organization.
                </Text>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};
