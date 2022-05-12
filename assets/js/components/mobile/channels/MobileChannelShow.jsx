import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import includes from 'lodash/includes'
import { Button, Collapse, Typography, Switch, Divider, Input } from "antd";
const { Text, Paragraph } = Typography;
const { Panel } = Collapse;
import { useHistory } from "react-router-dom";
import { CopyToClipboard } from "react-copy-to-clipboard";
import EyeOutlined from "@ant-design/icons/EyeOutlined";
import EyeInvisibleOutlined from "@ant-design/icons/EyeInvisibleOutlined";
import ArrowLeftOutlined from "@ant-design/icons/ArrowLeftOutlined";
import HttpDetails from "../../channels/HttpDetails";
import AwsDetails from "../../channels/AwsDetails";
import MqttDetails from "../../channels//MqttDetails";
import Warning from "../../flows/Warning";
import WarningItem from "../../flows/WarningItem";
import UserCan, { userCan } from "../../common/UserCan";
import MobileAddResourceButton from "../../common/MobileAddResourceButton";
import analyticsLogger from "../../../util/analyticsLogger";
import { http_integrations, mqtt_integrations, getAllowedIntegrations } from '../../../util/integrationInfo'
import { updateChannel } from "../../../actions/channel";
import CopyIcon from "../../../../img/channels/mobile/copy.svg";
import DeleteChannelModal from "../../channels/DeleteChannelModal";
import ChannelConnectionDetails from "../../channels/ChannelConnectionDetails";
import {
  getDownlinkKey,
  getDownlinkUrl,
} from "../../channels/constants";
import { displayError } from "../../../util/messages";

export default ({ channel }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const currentRole = useSelector((state) => state.organization.currentRole);

  const [showDownlinkToken, setShowDownlinkToken] = useState(false);
  const [showDeleteChannelModal, setShowDeleteChannelModal] = useState(false);
  const [credentials, setCredentials] = useState({});
  const [validInput, setValidInput] = useState(true);

  const downlinkKey = getDownlinkKey(channel);
  const downlinkUrl = getDownlinkUrl(channel, downlinkKey);

  const allowedIntegrations = getAllowedIntegrations()

  const handleReceiveJoinsChange = (value) => {
    analyticsLogger.logEvent("ACTION_UPDATE_CHANNEL_RECEIVE_JOINS_MOBILE", {
      id: channel.id,
      receive_joins: value,
    });
    dispatch(updateChannel(channel.id, { receive_joins: value }));
  };

  const handleChangeDownlinkToken = () => {
    analyticsLogger.logEvent("ACTION_UPDATE_CHANNEL_DOWNLINK_TOKEN_MOBILE", {
      id: channel.id,
    });
    dispatch(updateChannel(channel.id, { downlink_token: "new" }));
  };

  const closeDeleteChannelModal = () => {
    setShowDeleteChannelModal(false);
  };

  const handleUpdateDetailsInput = (credentials, validInput = true) => {
    setCredentials(credentials);
    setValidInput(validInput);
  };

  const handleUpdateDetailsChange = () => {
    if (Object.keys(credentials).length > 0) {
      analyticsLogger.logEvent("ACTION_UPDATE_CHANNEL_DETAILS_MOBILE", {
        id: channel.id,
      });
      dispatch(updateChannel(channel.id, { credentials }));
      setCredentials({});
    } else {
      if (channel.type !== "aws") {
        displayError(
          "Integration details have not been updated, please update details before submitting"
        );
      } else {
        displayError(
          "Please make sure all form details are filled in properly"
        );
      }
    }
  };

  return (
    <>
      <div
        style={{
          padding: "10px 15px",
          boxShadow: "0px 3px 7px 0px #ccc",
          backgroundColor: "#F5F7F9",
          height: 100,
          position: "relative",
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
            history.push("/integrations");
          }}
        >
          Back to Integrations
        </Button>
        <div>
          <Text style={{ fontSize: 32, fontWeight: 600 }} ellipsis>
            {channel.name}
          </Text>
        </div>
      </div>

      {
        allowedIntegrations && !allowedIntegrations[channel.type] && (
          <div
            style={{
              padding: "25px 15px",
              backgroundColor: "#ffffff",
              height: "calc(100% - 100px)",
              overflowY: "scroll",
            }}
          >
            <Warning numberWarnings={1} />
            <WarningItem
              warningText={
                "Your Console operator has disabled this integration type, please contact them for more details. Connected devices will not send packets to this integration."
              }
            />
            <Paragraph>
              <Text strong>Type: </Text>
              <Text>{channel.type_name}</Text>
            </Paragraph>
            <Paragraph>
              <Text strong>ID: </Text>
              <Text code>{channel.id}</Text>
            </Paragraph>
          </div>
        )
      }
      {
        (!allowedIntegrations || allowedIntegrations[channel.type]) && (
          <div
            style={{
              padding: "25px 15px",
              backgroundColor: "#ffffff",
              height: "calc(100% - 100px)",
              overflowY: "scroll",
            }}
          >
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
                {channel.downlink_token && (
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
                              onClick={() =>
                                setShowDownlinkToken(!showDownlinkToken)
                              }
                            />
                          ) : (
                            <EyeInvisibleOutlined
                              onClick={() =>
                                setShowDownlinkToken(!showDownlinkToken)
                              }
                            />
                          )
                        }
                      />
                      <CopyToClipboard text={channel.downlink_token}>
                        <Button onClick={() => {}} type="primary">
                          <img src={CopyIcon}></img>
                        </Button>
                      </CopyToClipboard>
                    </div>
                    <Button
                      onClick={handleChangeDownlinkToken}
                      style={{ marginTop: 10 }}
                    >
                      Generate New Key
                    </Button>
                  </UserCan>
                )}
              </Panel>
              {includes(http_integrations, channel.type) && (
                <Panel header={<b>HTTP DETAILS</b>} key="2">
                  <HttpDetails channel={channel} />
                </Panel>
              )}
              {channel.type === "aws" && (
                <Panel header={<b>AWS DETAILS</b>}>
                  <AwsDetails channel={channel} key="2" />
                </Panel>
              )}
              {includes(mqtt_integrations, channel.type)  && (
                <Panel header={<b>MQTT DETAILS</b>} key="2">
                  <MqttDetails channel={channel} />
                </Panel>
              )}
            </Collapse>

            <ChannelConnectionDetails
              channel={channel}
              handleUpdateDetailsChange={handleUpdateDetailsChange}
              handleUpdateDetailsInput={handleUpdateDetailsInput}
              validInput={validInput}
              mobile
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: 60,
              }}
            >
              <Button
                type="danger"
                onClick={() => {
                  setShowDeleteChannelModal(true);
                }}
              >
                Delete Integration
              </Button>
            </div>
          </div>
        )
      }

      <MobileAddResourceButton />

      <DeleteChannelModal
        mobile
        open={showDeleteChannelModal}
        onClose={closeDeleteChannelModal}
        channel={channel}
      />
    </>
  );
};
