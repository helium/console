import React, { useState } from "react";
import { Button, Collapse, Typography } from "antd";
const { Text } = Typography;
const { Panel } = Collapse;
import { useHistory } from "react-router-dom";
import ArrowLeftOutlined from "@ant-design/icons/ArrowLeftOutlined";

export default ({ device }) => {
  const history = useHistory();

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
          <Panel header={<b>REAL TIME PACKETS</b>} key="1">

          </Panel>
        </Collapse>

        <Collapse defaultActiveKey="1" expandIconPosition="right" style={{ marginBottom: 25 }}>
          <Panel header={<b>EVENT LOG</b>} key="1">

          </Panel>
        </Collapse>

        <Collapse defaultActiveKey="1" expandIconPosition="right" style={{ marginBottom: 25 }}>
          <Panel header={<b>DEVICE DETAILS</b>} key="1">

          </Panel>
        </Collapse>

        <Collapse defaultActiveKey="1" expandIconPosition="right" style={{ marginBottom: 25 }}>
          <Panel header={<b>STATISTICS</b>} key="1">

          </Panel>
        </Collapse>

        <Collapse defaultActiveKey="1" expandIconPosition="right" style={{ marginBottom: 25 }}>
          <Panel header={<b>FLOWS</b>} key="1">

          </Panel>
        </Collapse>
      </div>
    </>
  );
};
