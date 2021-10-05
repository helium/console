import React, { Component } from "react";
import { blueForDeviceStatsLarge } from "../../util/colors";
import { DEVICE_SHOW_STATS, DEVICE_SHOW_DC_STATS } from "../../graphql/devices";
import { Typography, Card, Col, Spin, Row } from "antd";
import LoadingOutlined from "@ant-design/icons/LoadingOutlined";
import withGql from "../../graphql/withGql";
const { Text } = Typography;
const antLoader = (
  <LoadingOutlined style={{ fontSize: 50, color: "#38A2FF" }} spin />
);

class DeviceShowStats extends Component {
  state = {
    showDC: false,
  };

  componentDidUpdate(prevProps) {
    if (prevProps.device.total_packets !== this.props.device.total_packets) {
      this.props.deviceStatsQuery.refetch();
      this.props.deviceDcStatsQuery.refetch();
    }
  }

  renderTitle = () => (
    <span>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          this.setState({ showDC: false });
        }}
      >
        <Text
          style={{
            fontWeight: 600,
            marginRight: 15,
            color: this.state.showDC ? "#777777" : "#000000",
          }}
        >
          Packets Transferred
        </Text>
      </a>

      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          this.setState({ showDC: true });
        }}
      >
        <Text
          style={{
            fontWeight: 600,
            color: !this.state.showDC ? "#777777" : "#000000",
          }}
        >
          DC Used
        </Text>
      </a>
    </span>
  );

  render() {
    const { device, smallerText } = this.props;
    const { device_stats } = this.props.deviceStatsQuery;
    const { device_dc_stats } = this.props.deviceDcStatsQuery;
    const { showDC } = this.state;

    if (!showDC) {
      if (this.props.deviceStatsQuery.loading)
        return (
          <Card
            title={this.renderTitle()}
            bodyStyle={{ height: 300, paddingLeft: 0, paddingRight: 0 }}
          >
            <div
              style={{ overflowX: "scroll", paddingLeft: 24, paddingRight: 24 }}
              className="no-scroll-bar"
            >
              <Row style={{ minWidth: 300 }}>
                <Col span={12}>
                  <Text style={{ fontSize: 16, fontWeight: "300" }}>
                    All Time
                  </Text>
                  <br />
                  <Spin indicator={antLoader} style={{ marginTop: 10 }} />
                  <div style={{ marginBottom: 30 }} />
                  <Text style={{ fontSize: 16, fontWeight: "300" }}>
                    Last 30 Days
                  </Text>
                  <br />
                  <Spin indicator={antLoader} style={{ marginTop: 10 }} />
                </Col>
                <Col span={12}>
                  <Text style={{ fontSize: 16, fontWeight: "300" }}>
                    Last 7 Days
                  </Text>
                  <br />
                  <Spin indicator={antLoader} style={{ marginTop: 10 }} />
                  <div style={{ marginBottom: 30 }} />
                  <Text style={{ fontSize: 16, fontWeight: "300" }}>
                    Last 24 Hours
                  </Text>
                  <br />
                  <Spin indicator={antLoader} style={{ marginTop: 10 }} />
                </Col>
              </Row>
            </div>
          </Card>
        );
      if (this.props.deviceStatsQuery.error)
        return (
          <Card
            title={this.renderTitle()}
            bodyStyle={{ height: 300, paddingLeft: 0, paddingRight: 0 }}
          >
            <div
              style={{ overflowX: "scroll", paddingLeft: 24, paddingRight: 24 }}
              className="no-scroll-bar"
            >
              <Text>
                Data failed to load, please reload the page and try again
              </Text>
            </div>
          </Card>
        );
      return (
        <Card
          title={this.renderTitle()}
          bodyStyle={{ height: 300, paddingLeft: 0, paddingRight: 0 }}
        >
          <div
            style={{ overflowX: "scroll", paddingLeft: 24, paddingRight: 24 }}
            className="no-scroll-bar"
          >
            <Row style={{ minWidth: 300 }}>
              <Col span={12}>
                <Text style={{ fontSize: 16, fontWeight: "300" }}>
                  All Time
                </Text>
                <br />
                <Text
                  style={{
                    fontSize: smallerText ? 32 : 46,
                    color: blueForDeviceStatsLarge,
                    position: "relative",
                  }}
                >
                  {device.total_packets}
                </Text>
                <br />
                <div style={{ marginBottom: 30 }} />
                <Text style={{ fontSize: 16, fontWeight: "300" }}>
                  Last 30 Days
                </Text>
                <br />
                <Text
                  style={{
                    fontSize: smallerText ? 32 : 46,
                    color: blueForDeviceStatsLarge,
                    position: "relative",
                  }}
                >
                  {device_stats.packets_last_30d}
                </Text>
                <br />
              </Col>
              <Col span={12}>
                <Text style={{ fontSize: 16, fontWeight: "300" }}>
                  Last 7 Days
                </Text>
                <br />
                <Text
                  style={{
                    fontSize: smallerText ? 32 : 46,
                    color: blueForDeviceStatsLarge,
                    position: "relative",
                  }}
                >
                  {device_stats.packets_last_7d}
                </Text>
                <br />
                <div style={{ marginBottom: 30 }} />
                <Text style={{ fontSize: 16, fontWeight: "300" }}>
                  Last 24 Hours
                </Text>
                <br />
                <Text
                  style={{
                    fontSize: smallerText ? 32 : 46,
                    color: blueForDeviceStatsLarge,
                    position: "relative",
                  }}
                >
                  {device_stats.packets_last_1d}
                </Text>
                <br />
              </Col>
            </Row>
          </div>
        </Card>
      );
    } else {
      if (this.props.deviceDcStatsQuery.loading)
        return (
          <Card
            title={this.renderTitle()}
            bodyStyle={{ height: 300, paddingLeft: 0, paddingRight: 0 }}
          >
            <div
              style={{ overflowX: "scroll", paddingLeft: 24, paddingRight: 24 }}
              className="no-scroll-bar"
            >
              <Row style={{ minWidth: 300 }}>
                <Col span={12}>
                  <Text style={{ fontSize: 16, fontWeight: "300" }}>
                    All Time
                  </Text>
                  <br />
                  <Spin indicator={antLoader} style={{ marginTop: 10 }} />
                  <div style={{ marginBottom: 30 }} />
                  <Text style={{ fontSize: 16, fontWeight: "300" }}>
                    Last 30 Days
                  </Text>
                  <br />
                  <Spin indicator={antLoader} style={{ marginTop: 10 }} />
                </Col>
                <Col span={12}>
                  <Text style={{ fontSize: 16, fontWeight: "300" }}>
                    Last 7 Days
                  </Text>
                  <br />
                  <Spin indicator={antLoader} style={{ marginTop: 10 }} />
                  <div style={{ marginBottom: 30 }} />
                  <Text style={{ fontSize: 16, fontWeight: "300" }}>
                    Last 24 Hours
                  </Text>
                  <br />
                  <Spin indicator={antLoader} style={{ marginTop: 10 }} />
                </Col>
              </Row>
            </div>
          </Card>
        );
      if (this.props.deviceDcStatsQuery.error)
        return (
          <Card
            title={this.renderTitle()}
            bodyStyle={{ height: 300, paddingLeft: 0, paddingRight: 0 }}
          >
            <div
              style={{ overflowX: "scroll", paddingLeft: 24, paddingRight: 24 }}
              className="no-scroll-bar"
            >
              <Text>
                Data failed to load, please reload the page and try again
              </Text>
            </div>
          </Card>
        );
      return (
        <Card
          title={this.renderTitle()}
          bodyStyle={{ height: 300, paddingLeft: 0, paddingRight: 0 }}
        >
          <div
            style={{ overflowX: "scroll", paddingLeft: 24, paddingRight: 24 }}
            className="no-scroll-bar"
          >
            <Row style={{ minWidth: 300 }}>
              <Col span={12}>
                <Text style={{ fontSize: 16, fontWeight: "300" }}>
                  All Time
                </Text>
                <br />
                <Text
                  style={{
                    fontSize: smallerText ? 32 : 46,
                    color: blueForDeviceStatsLarge,
                    position: "relative",
                  }}
                >
                  {device.dc_usage}
                </Text>
                <br />
                <div style={{ marginBottom: 30 }} />
                <Text style={{ fontSize: 16, fontWeight: "300" }}>
                  Last 30 Days
                </Text>
                <br />
                <Text
                  style={{
                    fontSize: smallerText ? 32 : 46,
                    color: blueForDeviceStatsLarge,
                    position: "relative",
                  }}
                >
                  {device_dc_stats.dc_last_30d}
                </Text>
                <br />
              </Col>
              <Col span={12}>
                <Text style={{ fontSize: 16, fontWeight: "300" }}>
                  Last 7 Days
                </Text>
                <br />
                <Text
                  style={{
                    fontSize: smallerText ? 32 : 46,
                    color: blueForDeviceStatsLarge,
                    position: "relative",
                  }}
                >
                  {device_dc_stats.dc_last_7d}
                </Text>
                <br />
                <div style={{ marginBottom: 30 }} />
                <Text style={{ fontSize: 16, fontWeight: "300" }}>
                  Last 24 Hours
                </Text>
                <br />
                <Text
                  style={{
                    fontSize: smallerText ? 32 : 46,
                    color: blueForDeviceStatsLarge,
                    position: "relative",
                  }}
                >
                  {device_dc_stats.dc_last_1d}
                </Text>
                <br />
              </Col>
            </Row>
          </div>
        </Card>
      );
    }
  }
}

export default withGql(
  withGql(DeviceShowStats, DEVICE_SHOW_DC_STATS, (props) => ({
    fetchPolicy: "cache-first",
    variables: { id: props.device.id },
    name: "deviceDcStatsQuery",
  })),
  DEVICE_SHOW_STATS,
  (props) => ({
    fetchPolicy: "cache-first",
    variables: { id: props.device.id },
    name: "deviceStatsQuery",
  })
);
