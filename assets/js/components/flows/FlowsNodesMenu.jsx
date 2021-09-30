import React, { useState } from "react";
import { Typography } from "antd";
import MinusOutlined from "@ant-design/icons/MinusOutlined";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import LabelNode from "./nodes/LabelNode";
import FunctionNode from "./nodes/FunctionNode";
import ChannelNode from "./nodes/ChannelNode";
import DeviceNode from "./nodes/DeviceNode";
import LabelsIcon from "../../../img/flows-sidebar-labels-icon.svg";
import LabelsGreyIcon from "../../../img/flows-sidebar-labels-icon-grey.svg";
import DevicesIcon from "../../../img/flows-sidebar-devices-icon.svg";
import DevicesGreyIcon from "../../../img/flows-sidebar-devices-icon-grey.svg";
import FunctionIcon from "../../../img/flows-sidebar-functions-icon.svg";
import FunctionGreyIcon from "../../../img/flows-sidebar-functions-icon-grey.svg";
import UtilityIcon from "../../../img/flows-sidebar-utilities-icon.svg";
import UtilityGreyIcon from "../../../img/flows-sidebar-utilities-icon-grey.svg";
import IntegrationIcon from "../../../img/flows-sidebar-integrations-icon.svg";
import IntegrationGreyIcon from "../../../img/flows-sidebar-integrations-icon-grey.svg";
const { Text } = Typography;

export default ({ devices, labels, functions, channels }) => {
  const [showMenu, toggleMenu] = useState(false);
  const [tab, setTab] = useState("labels");

  const onDragStart = (event, node) => {
    event.dataTransfer.setData("node/id", node.id);
    event.dataTransfer.setData("node/type", node.type);
    event.dataTransfer.setData("node/name", node.data.label);

    if (node.type === "channelNode") {
      event.dataTransfer.setData("node/channel_type_name", node.data.type_name);
      event.dataTransfer.setData("node/channel_type", node.data.type);
      event.dataTransfer.setData("node/has_alerts", node.data.hasAlerts);
    }

    if (node.type === "labelNode") {
      event.dataTransfer.setData(
        "node/label_device_count",
        node.data.deviceCount
      );
      event.dataTransfer.setData("node/has_alerts", node.data.hasAlerts);
      event.dataTransfer.setData("node/multi_buy_id", node.data.multi_buy_id);
      event.dataTransfer.setData(
        "node/config_profile_id",
        node.data.config_profile_id
      );
      event.dataTransfer.setData(
        "node/devices_not_in_filter",
        node.data.devicesNotInFilter
      );
    }

    if (node.type === "deviceNode") {
      event.dataTransfer.setData("node/has_alerts", node.data.hasAlerts);
      event.dataTransfer.setData("node/multi_buy_id", node.data.multi_buy_id);
      event.dataTransfer.setData(
        "node/config_profile_id",
        node.data.config_profile_id
      );
      event.dataTransfer.setData("node/in_xor_filter", node.data.inXORFilter);
    }

    if (node.type === "functionNode") {
      event.dataTransfer.setData("node/function_format", node.data.format);
    }

    event.dataTransfer.effectAllowed = "move";
  };

  const renderChannels = () =>
    channels.length > 0 ? (
      channels.map((node) => (
        <div
          style={{ margin: "12px 0px 12px 0px" }}
          key={node.id}
          draggable
          onDragStart={(event) => onDragStart(event, node)}
        >
          <ChannelNode data={node.data} fromSidebar={true} />
        </div>
      ))
    ) : (
      <p>No Integrations</p>
    );

  const renderFunctions = () =>
    functions.length > 0 ? (
      functions.map((node) => (
        <div
          style={{ margin: "12px 0px 12px 0px" }}
          key={node.id}
          draggable
          onDragStart={(event) => onDragStart(event, node)}
        >
          <FunctionNode data={node.data} fromSidebar={true} />
        </div>
      ))
    ) : (
      <p>No Functions</p>
    );

  const renderLabels = () =>
    labels.length > 0 ? (
      labels.map((node) => (
        <div
          style={{ margin: "12px 0px 12px 0px" }}
          key={node.id}
          draggable
          onDragStart={(event) => onDragStart(event, node)}
        >
          <LabelNode data={node.data} fromSidebar={true} />
        </div>
      ))
    ) : (
      <p>No Labels</p>
    );

  const renderDevices = () =>
    devices.length > 0 ? (
      devices.map((node) => (
        <div
          style={{ margin: "12px 0px 12px 0px" }}
          key={node.id}
          draggable
          onDragStart={(event) => onDragStart(event, node)}
        >
          <DeviceNode data={node.data} fromSidebar={true} />
        </div>
      ))
    ) : (
      <p>No Devices</p>
    );

  const renderUtilities = () =>
    [{ id: "none" }].map((node) => (
      <div
        style={{ marginBottom: 12 }}
        key={node.id}
        onDragStart={(event) => onDragStart(event, node)}
      >
        <p>No Utilities</p>
      </div>
    ));

  return (
    <div
      style={{
        position: "absolute",
        top: 20,
        left: 20,
        backgroundColor: "#ffffff",
        borderRadius: 6,
        zIndex: 100,
        width: 300,
        boxShadow: "0px 20px 20px -7px rgba(17, 24, 31, 0.19)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 10,
        }}
      >
        <Text
          className="noselect"
          style={{ fontSize: 12, color: "#596777", fontWeight: 600 }}
        >
          NODES
        </Text>
        <div
          onClick={() => toggleMenu(!showMenu)}
          style={{ cursor: "pointer" }}
        >
          {showMenu ? (
            <MinusOutlined
              className="noselect"
              style={{ color: "#BECDDC", fontSize: 14 }}
            />
          ) : (
            <PlusOutlined
              className="noselect"
              style={{ color: "#BECDDC", fontSize: 14 }}
            />
          )}
        </div>
      </div>
      {showMenu && (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 15px 0px 15px",
            borderBottom: "0.5px solid #BECBD9",
          }}
        >
          <div
            style={{
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginRight: 5,
              paddingBottom: 10,
              borderBottom:
                tab === "labels" ? "4px solid #2C79EE" : "4px solid #ffffff",
            }}
            onClick={() => setTab("labels")}
            className="noselect"
          >
            {tab === "labels" ? (
              <img draggable="false" src={LabelsIcon} style={{ height: 20 }} />
            ) : (
              <img
                draggable="false"
                src={LabelsGreyIcon}
                style={{ height: 20 }}
              />
            )}
            <Text
              style={{
                display: "block",
                color: tab === "labels" ? "#2C79EE" : "#D8E2EC",
                fontWeight: 500,
                marginTop: 4,
              }}
            >
              Labels
            </Text>
          </div>
          <div
            style={{
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginLeft: 5,
              marginRight: 5,
              paddingBottom: 10,
              borderBottom:
                tab === "devices" ? "4px solid #A6B8CC" : "4px solid #ffffff",
            }}
            onClick={() => setTab("devices")}
            className="noselect"
          >
            {tab === "devices" ? (
              <img draggable="false" src={DevicesIcon} style={{ height: 20 }} />
            ) : (
              <img
                draggable="false"
                src={DevicesGreyIcon}
                style={{ height: 20 }}
              />
            )}
            <Text
              style={{
                display: "block",
                color: tab === "devices" ? "#A6B8CC" : "#D8E2EC",
                fontWeight: 500,
                marginTop: 4,
              }}
            >
              Devices
            </Text>
          </div>
          <div
            style={{
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginLeft: 5,
              marginRight: 5,
              paddingBottom: 10,
              borderBottom:
                tab === "functions" ? "4px solid #9E59F6" : "4px solid #ffffff",
            }}
            onClick={() => setTab("functions")}
            className="noselect"
          >
            {tab === "functions" ? (
              <img
                draggable="false"
                src={FunctionIcon}
                style={{ height: 20 }}
              />
            ) : (
              <img
                draggable="false"
                src={FunctionGreyIcon}
                style={{ height: 20 }}
              />
            )}
            <Text
              style={{
                display: "block",
                color: tab === "functions" ? "#9E59F6" : "#D8E2EC",
                fontWeight: 500,
                marginTop: 4,
              }}
            >
              Functions
            </Text>
          </div>
          {false && (
            <div
              style={{
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginLeft: 5,
                marginRight: 5,
                paddingBottom: 10,
                borderBottom:
                  tab === "utilities"
                    ? "4px solid #F18F47"
                    : "4px solid #ffffff",
              }}
              onClick={() => setTab("utilities")}
              className="noselect"
            >
              {tab === "utilities" ? (
                <img
                  draggable="false"
                  src={UtilityIcon}
                  style={{ height: 20 }}
                />
              ) : (
                <img
                  draggable="false"
                  src={UtilityGreyIcon}
                  style={{ height: 20 }}
                />
              )}
              <Text
                style={{
                  display: "block",
                  color: tab === "utilities" ? "#F18F47" : "#D8E2EC",
                  fontWeight: 500,
                  marginTop: 4,
                }}
              >
                Utilities
              </Text>
            </div>
          )}
          <div
            style={{
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginLeft: 5,
              paddingBottom: 10,
              borderBottom:
                tab === "channels" ? "4px solid #12CB9E" : "4px solid #ffffff",
            }}
            onClick={() => setTab("channels")}
            className="noselect"
          >
            {tab === "channels" ? (
              <img
                draggable="false"
                src={IntegrationIcon}
                style={{ height: 20 }}
              />
            ) : (
              <img
                draggable="false"
                src={IntegrationGreyIcon}
                style={{ height: 20 }}
              />
            )}
            <Text
              style={{
                display: "block",
                color: tab === "channels" ? "#12CB9E" : "#D8E2EC",
                fontWeight: 500,
                marginTop: 4,
              }}
            >
              Integrations
            </Text>
          </div>
        </div>
      )}
      {showMenu && (
        <div
          style={{
            paddingLeft: 15,
            paddingRight: 15,
            marginTop: 0,
            maxHeight: "calc(100vh - 270px)",
            overflowY: "scroll",
          }}
        >
          {tab === "labels" && renderLabels()}
          {tab === "devices" && renderDevices()}
          {tab === "functions" && renderFunctions()}
          {tab === "utilities" && renderUtilities()}
          {tab === "channels" && renderChannels()}
        </div>
      )}
    </div>
  );
};
