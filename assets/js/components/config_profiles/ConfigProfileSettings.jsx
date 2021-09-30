import React, { Fragment, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Switch, Input, Button } from "antd";
import Text from "antd/lib/typography/Text";
import UserCan, { userCan } from "../common/UserCan";
import {
  adrText1,
  adrText2,
  cfListText1,
  cfListText2,
  cfListText3,
} from "./constants";

export default ({ show, data, save, saveIcon, back, cancel }) => {
  const currentRole = useSelector((state) => state.organization.currentRole);
  const [configProfileData, setConfigProfileData] = useState({});
  const [name, setName] = useState("");
  const [adrAllowed, setAdrAllowed] = useState(false);
  const [cfListEnabled, setCfListEnabled] = useState(false);

  useEffect(() => {
    if (show && data) {
      setConfigProfileData({
        name: data.configProfile.name,
        adr_allowed: data.configProfile.adr_allowed,
        cf_list_enabled: data.configProfile.cf_list_enabled,
      });
      setName(data.configProfile.name);
      setAdrAllowed(data.configProfile.adr_allowed);
      setCfListEnabled(data.configProfile.cf_list_enabled);
    }
  }, [data]);

  const renderButton = () => {
    return (
      <UserCan>
        <Button
          icon={saveIcon}
          type="primary"
          style={{
            borderColor: "#2C79EE",
            backgroundColor: "#2C79EE",
            borderRadius: 50,
            text: "white",
            marginTop: 15,
          }}
          onClick={() => {
            save({
              name,
              adrAllowed,
              cfListEnabled,
            });
          }}
        >
          {show ? "Update" : "Create"} Profile
        </Button>
      </UserCan>
    );
  };

  return (
    <Fragment>
      <Text style={{ fontSize: "16px" }} strong>
        Profile Name
      </Text>
      <Input
        onChange={(e) => {
          setName(e.target.value);
        }}
        value={name}
        placeholder={show ? configProfileData.name : "e.g. My Profile"}
        suffix={`${name.length}/25`}
        maxLength={25}
        disabled={!userCan({ role: currentRole })}
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
          disabled={!userCan({ role: currentRole })}
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
          disabled={!userCan({ role: currentRole })}
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

      <div style={{ marginBottom: 20 }}>
        {renderButton()}
        {cancel && (
          <Button
            style={{ marginLeft: 10, borderRadius: 50 }}
            onClick={() => {
              back();
            }}
          >
            Cancel
          </Button>
        )}
      </div>
    </Fragment>
  );
};
