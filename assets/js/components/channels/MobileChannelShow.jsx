import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Collapse, Typography, Switch, Divider, Input } from "antd";
const { Text, Paragraph } = Typography;
const { Panel } = Collapse;
import { useHistory } from "react-router-dom";
import { CopyToClipboard } from "react-copy-to-clipboard";
import EyeOutlined from "@ant-design/icons/EyeOutlined";
import EyeInvisibleOutlined from "@ant-design/icons/EyeInvisibleOutlined";
import ArrowLeftOutlined from "@ant-design/icons/ArrowLeftOutlined";
import HttpDetails from "./HttpDetails";
import AwsDetails from "./AwsDetails";
import MqttDetails from "./MqttDetails";
import UserCan, { userCan } from "../common/UserCan";
import analyticsLogger from "../../util/analyticsLogger";
import { updateChannel } from "../../actions/channel";
import CopyIcon from "../../../img/channels/mobile/copy.svg";

export default ({ channel }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const currentRole = useSelector((state) => state.organization.currentRole);

  const [showDownlinkToken, setShowDownlinkToken] = useState(false);

  // TODO extract into its own thing
  const downlinkKey = channel.downlink_token || `{:downlink_key}`;
  let downlinkUrl = `http://localhost:4000/api/v1/down/${channel.id}/${downlinkKey}/{:optional_device_id}`;
  if (process.env.SELF_HOSTED && window.env_domain !== "localhost:4000") {
    downlinkUrl = `https://${window.env_domain}/api/v1/down/${channel.id}/${downlinkKey}/{:optional_device_id}`;
  }
  if (!process.env.SELF_HOSTED) {
    downlinkUrl = `https://${process.env.ENV_DOMAIN}/api/v1/down/${channel.id}/${downlinkKey}/{:optional_device_id}`;
  }

  const handleReceiveJoinsChange = (value) => {
    analyticsLogger.logEvent("ACTION_UPDATE_CHANNEL_RECEIVE_JOINS", {
      id: channel.id,
      receive_joins: value,
    });
    dispatch(updateChannel(channel.id, { receive_joins: value }));
  };

  const handleChangeDownlinkToken = () => {
    analyticsLogger.logEvent("ACTION_UPDATE_CHANNEL_DOWNLINK_TOKEN", {
      id: channel.id,
    });
    dispatch(updateChannel(channel.id, { downlink_token: "new" }));
  };

  return (
    <>
      <div
        style={{
          padding: "10px 15px",
          boxShadow: "0px 3px 7px 0px #ccc",
          backgroundColor: "#F5F7F9",
          height: 100,
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
          <Panel header={<b>INTEGRATION DETAILS</b>} key="1">
            <Paragraph>
              <Text strong>Type: </Text>
              <Text>{channel.type_name}</Text>
            </Paragraph>
            <Paragraph>
              <Text strong>ID: </Text>
              <Text code>{channel.id}</Text>
            </Paragraph>
            <Paragraph>
              <Text strong>Receive Device Joins: </Text>
              <Switch
                style={{ marginLeft: 2 }}
                checked={channel.receive_joins}
                onChange={handleReceiveJoinsChange}
                disabled={!userCan({ role: currentRole })}
              />
            </Paragraph>
            <Paragraph>
              <Text strong># Piped Devices: </Text>
              <Text>{channel.number_devices}</Text>
            </Paragraph>
            <UserCan>
              <Divider />
              <Text>Downlink URL</Text>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  marginBottom: 16,
                }}
              >
                <Input value={downlinkUrl} style={{ marginRight: 10 }} />
                <CopyToClipboard text={downlinkUrl}>
                  <Button
                    onClick={() => {}}
                    style={{ marginRight: 0 }}
                    type="primary"
                  >
                    <img src={CopyIcon} />
                  </Button>
                </CopyToClipboard>
              </div>
              <Text>Downlink Key</Text>
              <div style={{ display: "flex", flexDirection: "row" }}>
                <Input
                  value={
                    showDownlinkToken
                      ? channel.downlink_token
                      : "************************"
                  }
                  style={{
                    marginRight: 10,
                    color: "#38A2FF",
                    fontFamily: "monospace",
                  }}
                  suffix={
                    showDownlinkToken ? (
                      <EyeOutlined
                        onClick={() => setShowDownlinkToken(!showDownlinkToken)}
                      />
                    ) : (
                      <EyeInvisibleOutlined
                        onClick={() => setShowDownlinkToken(!showDownlinkToken)}
                      />
                    )
                  }
                />
                <CopyToClipboard text={channel.downlink_token}>
                  <Button
                    onClick={() => {}}
                    style={{ marginRight: 10 }}
                    type="primary"
                  >
                    <img src={CopyIcon}></img>
                  </Button>
                </CopyToClipboard>
                <Button
                  onClick={handleChangeDownlinkToken}
                  style={{ marginRight: 0 }}
                >
                  Generate New Key
                </Button>
              </div>
            </UserCan>
          </Panel>
          {channel.type === "http" && (
            <Panel header={<b>HTTP DETAILS</b>} key="2">
              <HttpDetails channel={channel} />
            </Panel>
          )}
          {channel.type === "aws" && (
            <Panel header="AWS Details">
              <AwsDetails channel={channel} key="2" />
            </Panel>
          )}
          {channel.type === "mqtt" && (
            <Panel header="MQTT Details" key="2">
              <MqttDetails channel={channel} />
            </Panel>
          )}
        </Collapse>
        <Collapse expandIconPosition="right" style={{ margin: "25px 0" }}>
          <Panel header={<b>UPDATE YOUR CONNECTION DETAILS</b>} key="1"></Panel>
        </Collapse>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button type="danger">Delete Integration</Button>
        </div>
      </div>
    </>
  );
};
