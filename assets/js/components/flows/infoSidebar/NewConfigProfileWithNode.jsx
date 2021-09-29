import React, { useState } from "react";
import { useDispatch } from "react-redux";
import Text from "antd/lib/typography/Text";
import { Button, Input, Switch } from "antd";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import {
  createConfigProfile,
  addConfigProfileToNode,
} from "../../../actions/configProfile";
import analyticsLogger from "../../../util/analyticsLogger";

const adrText1 =
  "ADR allows devices to use an optimal data rate which reduces power consumption and airtime on the network based on RF conditions. When ADR is disabled the channel mask is still transmitted via ADR command, but power output and data rates are not impacted. ";
const adrText2 =
  "Recommended: only use ADR for fixed or non-mobile devices to ensure reliable connectivity.";

const cfListText1 = `
  The Join-Accept CF List configures channels according to
  the LoRaWAN spec to use sub-band 2. Devices that have not correctly implemented the
  LoRaWAN spec may experience transfer issues when this setting is enabled.
`;

const cfListText2 =
  "- Enabled, the server will send a CF List with every other join.";

const cfListText3 =
  "- Disabled, the server will not send a CF List. The channel mask is still transmitted via ADR command.";

export default (props) => {
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [adrAllowed, setAdrAllowed] = useState(false);
  const [cfListEnabled, setCfListEnabled] = useState(false);
  return (
    <div style={{ padding: "0px 40px 0px 40px" }}>
      <Text
        style={{ display: "block", fontSize: "20px", marginBottom: 5 }}
        strong
      >
        Create New Profile
      </Text>
      <Text style={{ fontSize: "16px" }} strong>
        Profile Name
      </Text>
      <Input
        onChange={(e) => {
          setName(e.target.value);
        }}
        value={name}
        placeholder={"e.g. My Profile"}
        suffix={`${name.length}/25`}
        maxLength={25}
      />

      <div
        style={{
          margin: "25px 0",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Switch
          onChange={(checked) => {
            setAdrAllowed(checked);
          }}
          checked={adrAllowed}
          style={{ marginRight: 8 }}
        />
        <Text strong style={{ fontSize: 16 }}>
          Allow ADR (recommended for stationary devices)
        </Text>
      </div>

      <div style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 14, display: "block", marginBottom: 4 }}>
          {adrText1}
        </Text>
        <Text style={{ fontSize: 14, display: "block" }}>{adrText2}</Text>
      </div>

      <div
        style={{
          marginBottom: 20,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Switch
          onChange={(checked) => {
            setCfListEnabled(checked);
          }}
          checked={cfListEnabled}
          style={{ marginRight: 8 }}
        />
        <Text strong style={{ fontSize: 16 }}>
          Enable Join-Accept CF List (applicable to US915 devices only)
        </Text>
      </div>

      <div style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 14, display: "block", marginBottom: 4 }}>
          {cfListText1}
        </Text>
        <Text style={{ fontSize: 14, display: "block" }}>{cfListText2}</Text>
        <Text style={{ fontSize: 14, display: "block" }}>{cfListText3}</Text>
      </div>

      <Button
        icon={<PlusOutlined />}
        type="primary"
        style={{
          borderColor: "#2C79EE",
          backgroundColor: "#2C79EE",
          borderRadius: 50,
          text: "white",
        }}
        onClick={() => {
          analyticsLogger.logEvent("ACTION_CREATE_CONFIG_PROFILE", {
            name: name,
            adr_allowed: adrAllowed,
            cf_list_enabled: cfListEnabled,
          });
          dispatch(
            createConfigProfile({
              name: name,
              adr_allowed: adrAllowed,
              cf_list_enabled: cfListEnabled,
            })
          )
            .then((data) => {
              analyticsLogger.logEvent("ACTION_ADD_CONFIG_PROFILE_TO_NODE", {
                configProfileId: data.data.id,
                nodeId: props.nodeId,
                nodeType: props.nodeType,
              });
              return dispatch(
                addConfigProfileToNode(
                  data.data.id,
                  props.nodeId,
                  props.nodeType
                )
              );
            })
            .then(() => {
              props.back();
            });
        }}
      >
        Create Profile
      </Button>
      <Button
        style={{ marginLeft: 10, borderRadius: 50 }}
        onClick={() => {
          props.back();
        }}
      >
        Cancel
      </Button>
    </div>
  );
};
