import React from "react";
import numeral from "numeral";
import { Typography, Row, Col } from "antd";
const { Text } = Typography;

export default (props) => {
  const renderDiffPacketCount = (hotspot) => {
    const positive = hotspot.packet_count - hotspot.packet_count_2d >= 0;
    return (
      <Text style={{ fontSize: 18, color: positive ? "#12CB9E" : "#F15B47" }}>
        {hotspot.packet_count_2d !== 0 &&
          `${positive ? "+" : ""}${(
            ((hotspot.packet_count - hotspot.packet_count_2d) /
              hotspot.packet_count_2d) *
            100
          ).toFixed(2)}%`}
      </Text>
    )
  }

  const renderDiffDeviceCount = (hotspot) => {
    const positive = hotspot.device_count - hotspot.device_count_2d >= 0;
    return (
      <Text style={{ fontSize: 18, color: positive ? "#12CB9E" : "#F15B47" }}>
        {hotspot.device_count_2d !== 0 &&
          `${positive ? "+" : ""}${(
            ((hotspot.device_count - hotspot.device_count_2d) /
              hotspot.device_count_2d) *
            100
          ).toFixed(2)}%`}
      </Text>
    )
  }

  const styles = {
    container: {
      backgroundColor: '#F5F7F9',
      borderRadius: 6,
      padding: '8px 16px 8px 16px',
      overflow: 'hidden',
      height: '100%'
    }
  }

  return (
    <div style={{ padding: 25, paddingTop: 0 }}>
      <Row gutter={12}>
        <Col sm={8}>
          <div
            style={styles.container}
          >
            <Text style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 8 }}>Most Heard Device</Text>
            <Text style={{ fontSize: 24, fontWeight: 500, color: '#2C79EE', display: 'block' }}>
              {props.hotspot.most_heard_device_name || "No Devices Heard"}
            </Text>
            <Text style={{ fontSize: 18, color: '#2C79EE', display: 'block' }}>
              {props.hotspot.most_heard_packet_count != 0 ? numeral(props.hotspot.most_heard_packet_count).format("0,0") : ""} packets
            </Text>
          </div>
        </Col>
        <Col sm={8}>
          <div
            style={styles.container}
          >
            <Text style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 8 }}>Total Packets</Text>
            <Text style={{ fontSize: 24, fontWeight: 500, marginRight: 8 }}>{numeral(props.hotspot.packet_count).format("0,0")}</Text>
            {renderDiffPacketCount(props.hotspot)}
          </div>
        </Col>
        <Col sm={8}>
          <div
            style={styles.container}
          >
            <Text style={{ fontSize: 14, fontWeight: 600, display: 'block', marginBottom: 8 }}>Number of Devices</Text>
            <Text style={{ fontSize: 24, fontWeight: 500, marginRight: 8 }}>{numeral(props.hotspot.device_count).format("0,0")}</Text>
            {renderDiffDeviceCount(props.hotspot)}
          </div>
        </Col>
      </Row>
    </div>
  );
};
