import React, { useState } from "react";
import EventsDashboard from "../../events/EventsDashboard";
import DeviceShowStats from "../../devices/DeviceShowStats";
import DeviceFlows from "../../devices/DeviceFlows";
import UserCan from "../../common/UserCan";
import { Button, Collapse, Typography } from "antd";
const { Text, Paragraph } = Typography;
const { Panel } = Collapse;
import { useHistory } from "react-router-dom";
import ArrowLeftOutlined from "@ant-design/icons/ArrowLeftOutlined";
import EyeOutlined from "@ant-design/icons/EyeOutlined";
import EyeInvisibleOutlined from "@ant-design/icons/EyeInvisibleOutlined";

export default ({ device }) => {
  const history = useHistory();
  const [showAppKey, setShowAppKey] = useState(false);

  return (
    <>
      <div
        style={{
          padding: "10px 15px",
          boxShadow: "0px 3px 7px 0px #ccc",
          backgroundColor: "#F5F7F9",
          height: 100,
          position: 'relative',
          zIndex: 10,
        }}
      >
        <Button
          icon={<ArrowLeftOutlined style={{ fontSize: 12 }} />}
          style={{
            border: "none",
            padding: 0,
            fontSize: 14,
            color: "#2C79EE",
            height: 24,
            boxShadow: "none",
            background: "none",
            fontWeight: 600,
          }}
          onClick={() => {
            history.push("/devices");
          }}
        >
          Back to Devices
        </Button>
        <div>
          <Text style={{ fontSize: 32, fontWeight: 600 }}>{device.name}</Text>
        </div>
      </div>
      <div style={{ padding: "25px 15px", backgroundColor: '#ffffff', height: "calc(100% - 100px)", overflowY: 'scroll' }}>
        <Collapse defaultActiveKey="1" expandIconPosition="right" style={{ marginBottom: 25 }}>
          <Panel header={<b>REAL TIME PACKETS</b>} key="1" id="event-dashboard-panel">
            <EventsDashboard device_id={device.id} mobile={true} />
          </Panel>
        </Collapse>

        <Collapse defaultActiveKey="1" expandIconPosition="right" style={{ marginBottom: 25 }}>
          <Panel header={<b>DEVICE DETAILS</b>} key="1">
            <Paragraph>
              <Text strong>Name: </Text>
              <Text style={{ marginRight: 5 }}>
                {device.name}{" "}
              </Text>
            </Paragraph>
            <Paragraph>
              <Text strong>ID: </Text>
              <Text style={{ whiteSpace: "nowrap" }}>
                {device.id}
              </Text>
            </Paragraph>
            <Paragraph>
              <Text strong>Device EUI: </Text>
              <Text style={{ whiteSpace: "nowrap" }}>
                {device.dev_eui}
              </Text>
            </Paragraph>
            <Paragraph>
              <Text strong>App EUI: </Text>
              <Text style={{ whiteSpace: "nowrap" }}>
                {device.app_eui}
              </Text>
            </Paragraph>
            <UserCan>
              <Paragraph>
                <Text strong>App Key: </Text>
                {showAppKey ? (
                  <EyeOutlined
                    onClick={() => setShowAppKey(!showAppKey)}
                    style={{ marginRight: 5 }}
                  />
                ) : (
                  <EyeInvisibleOutlined
                    onClick={() => setShowAppKey(!showAppKey)}
                    style={{ marginRight: 5 }}
                  />
                )}

                {showAppKey && (
                  <Text style={{ whiteSpace: "nowrap" }}>
                    {device.app_key}
                  </Text>
                )}
                {!showAppKey && (
                  <Text>************************</Text>
                )}
              </Paragraph>
            </UserCan>
            <Paragraph style={{ marginBottom: 0 }}>
              <Text strong>Activation Method: </Text>
              <Text style={{ whiteSpace: "nowrap" }}>
                OTAA
              </Text>
            </Paragraph>
          </Panel>
        </Collapse>

        <Collapse defaultActiveKey="1" expandIconPosition="right" style={{ marginBottom: 25 }}>
          <Panel header={<b>STATISTICS</b>} key="1" id="device-stats-panel">
            <DeviceShowStats device={device} smallerText={device.total_packets > 10000} mobile={true} />
          </Panel>
        </Collapse>

        <Collapse defaultActiveKey="1" expandIconPosition="right" style={{ marginBottom: 25 }}>
          <Panel header={<b>FLOWS</b>} key="1" id="device-flows-panel">
            <DeviceFlows deviceId={device.id} mobile={true} />
          </Panel>
        </Collapse>
      </div>
    </>
  );
};
