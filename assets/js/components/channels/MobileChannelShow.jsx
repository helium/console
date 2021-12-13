import React from "react";
import { Button, Collapse, Typography } from "antd";
const { Text } = Typography;
const { Panel } = Collapse;
import { useHistory } from "react-router-dom";
import ArrowLeftOutlined from "@ant-design/icons/ArrowLeftOutlined";

export default ({ channel }) => {
  const history = useHistory();
  return (
    <div
      style={{
        height: "100%",
        overflowY: "hidden",
        backgroundColor: "#ffffff",
      }}
    >
      <div
        style={{
          padding: "10px 15px",
          boxShadow: "0px 3px 7px 0px #ccc",
          backgroundColor: "#F5F7F9",
          height: 110,
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
            history.push("/integrations");
          }}
        >
          Back to Integrations
        </Button>
        <div>
          <Text style={{ fontSize: 32, fontWeight: 600 }}>{channel.name}</Text>
        </div>
      </div>
      <div style={{ padding: "25px 15px" }}>
        <Collapse defaultActiveKey={["1", "2"]} expandIconPosition="right">
          <Panel header={<b>INTEGRATION DETAILS</b>} key="1"></Panel>
          <Panel header={<b>HTTP DETAILS</b>} key="2"></Panel>
        </Collapse>
        <Collapse expandIconPosition="right" style={{ margin: "25px 0" }}>
          <Panel header={<b>UPDATE YOUR CONNECTION DETAILS</b>} key="1"></Panel>
        </Collapse>
        <Button style={{ float: "right" }} type="danger">
          Delete Integration
        </Button>
      </div>
    </div>
  );
};
