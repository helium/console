import React, { useState, Fragment, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Button, Row, Col, Input, Typography, Switch } from "antd";
import { useQuery } from "@apollo/client";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import EditOutlined from "@ant-design/icons/EditOutlined";
import MultiBuyIcon from "../../../img/multi_buy/multi-buy-index-add-icon.svg";
const { Text } = Typography;
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import UserCan, { userCan } from "../common/UserCan";
import analyticsLogger from "../../util/analyticsLogger";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import { SkeletonLayout } from "../common/SkeletonLayout";
import { CONFIG_PROFILE_SHOW } from "../../graphql/configProfiles";
import {
  createConfigProfile,
  updateConfigProfile,
} from "../../actions/configProfile";

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

export default ({ show, id, openDeleteConfigProfileModal }) => {
  const history = useHistory();
  const currentRole = useSelector((state) => state.organization.currentRole);
  const [name, setName] = useState("");
  const [adrAllowed, setAdrAllowed] = useState(false);
  const [cfListEnabled, setCfListEnabled] = useState(false);
  const [configProfileData, setConfigProfileData] = useState({});
  const dispatch = useDispatch();

  const { loading, error, data, refetch } = useQuery(CONFIG_PROFILE_SHOW, {
    variables: { id },
    skip: !id,
  });

  const socket = useSelector((state) => state.apollo.socket);
  useEffect(() => {
    if (show) {
      const configProfileShowChannel = socket.channel(
        "graphql:config_profile_show",
        {}
      );

      // executed when mounted
      configProfileShowChannel.join();
      configProfileShowChannel.on(
        `graphql:config_profile_show:${id}:config_profile_update`,
        (_message) => {
          refetch();
        }
      );

      // executed when unmounted
      return () => {
        configProfileShowChannel.leave();
      };
    }
  }, []);

  useEffect(() => {
    if (!loading && !error && data) {
      setConfigProfileData({
        name: data.configProfile.name,
        adr_allowed: data.configProfile.adr_allowed,
        cf_list_enabled: data.configProfile.cf_list_enabled,
      });
      setAdrAllowed(data.configProfile.adr_allowed);
      setCfListEnabled(data.configProfile.cf_list_enabled);
    }
  }, [data]);

  return (
    <div style={{ padding: "30px 30px 20px 30px" }}>
      {show && !error && (
        <UserCan>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            <Button
              size="middle"
              type="danger"
              style={{ borderRadius: 5, marginRight: 50 }}
              onClick={() => openDeleteConfigProfileModal(data.configProfile)}
              icon={<DeleteOutlined />}
            >
              Delete Profile
            </Button>
          </div>
        </UserCan>
      )}
      <Row style={{ marginTop: "10px" }}>
        <Col span={10} style={{ padding: "70px 80px" }}>
          <img src={MultiBuyIcon} />
          <h1 style={{ marginTop: 10, fontSize: "23px", fontWeight: 600 }}>
            Profiles
          </h1>
          <div>
            <p style={{ fontSize: "16px" }}>
              Configuration Profiles can be added to device/label nodes.
              Profiles assigned to labels take priority over profiles assigned
              to individual devices. For example, if a device has Profile A, and
              a label has Profile B, if that label is applied to the device then
              Profile B overrides Profile A.
            </p>
            <p>
              <a
                className="help-link"
                href="https://docs.helium.com/use-the-network/console/config-profiles"
                target="_blank"
              >
                Learn more about Profiles
              </a>
            </p>
          </div>
        </Col>
        <Col span={12} style={{ padding: "40px 20px" }}>
          {error && (
            <Text>
              Data failed to load, please reload the page and try again
            </Text>
          )}
          {loading && <SkeletonLayout />}
          {!error && !loading && (
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
                <Text
                  style={{ fontSize: 14, display: "block", marginBottom: 4 }}
                >
                  {adrText1}
                </Text>
                <Text style={{ fontSize: 14, display: "block" }}>
                  {adrText2}
                </Text>
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
                <Text
                  style={{ fontSize: 14, display: "block", marginBottom: 4 }}
                >
                  {cfListText1}
                </Text>
                <Text style={{ fontSize: 14, display: "block" }}>
                  {cfListText2}
                </Text>
                <Text style={{ fontSize: 14, display: "block" }}>
                  {cfListText3}
                </Text>
              </div>

              <UserCan>
                <Button
                  icon={show ? <EditOutlined /> : <PlusOutlined />}
                  type="primary"
                  style={{
                    borderColor: "#2C79EE",
                    backgroundColor: "#2C79EE",
                    borderRadius: 50,
                    text: "white",
                    marginTop: 15,
                  }}
                  onClick={() => {
                    if (show) {
                      analyticsLogger.logEvent("ACTION_UPDATE_CONFIG_PROFILE", {
                        id,
                        adrAllowed,
                        cfListEnabled,
                      });
                      dispatch(
                        updateConfigProfile(id, {
                          ...(name && { name }),
                          adr_allowed: adrAllowed,
                          cf_list_enabled: cfListEnabled,
                        })
                      );
                    } else {
                      analyticsLogger.logEvent("ACTION_CREATE_CONFIG_PROFILE", {
                        id,
                        adrAllowed,
                        cfListEnabled,
                      });
                      dispatch(
                        createConfigProfile({
                          name,
                          adr_allowed: adrAllowed,
                          cf_list_enabled: cfListEnabled,
                        })
                      ).then(() => {
                        history.push("/config_profiles");
                      });
                    }
                  }}
                >
                  {show ? "Update" : "Create"} Profile
                </Button>
              </UserCan>
            </Fragment>
          )}
        </Col>
      </Row>
    </div>
  );
};
