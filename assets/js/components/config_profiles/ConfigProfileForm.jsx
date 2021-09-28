import React, { useState, Fragment } from "react";
import { useDispatch } from "react-redux";
import { Button, Row, Col, Input, Typography, Switch } from "antd";
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

export default ({ show, id }) => {
  const history = useHistory();
  const currentRole = useSelector((state) => state.organization.currentRole);
  const [name, setName] = useState("");
  const dispatch = useDispatch();
  const error = false; // TODO remove
  const loading = false; // TODO remove

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
              onClick={() => console.log("deleting")}
              icon={<DeleteOutlined />}
            >
              Delete Config Profile
            </Button>
          </div>
        </UserCan>
      )}
      <Row style={{ marginTop: "10px" }}>
        <Col span={10} style={{ padding: "70px 80px" }}>
          <img src={MultiBuyIcon} />
          <h1 style={{ marginTop: 10, fontSize: "23px", fontWeight: 600 }}>
            Config Profiles
          </h1>
          <div>
            <p style={{ fontSize: "16px" }}>
              You can configure different profiles for devices and labels.
            </p>
            <p>
              <a
                className="help-link"
                href="https://docs.helium.com/use-the-network/console/config-profiles"
                target="_blank"
              >
                Learn more about Config Profiles
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
                Config Profile Name
              </Text>
              <Input
                onChange={(e) => {
                  setName(e.target.value);
                }}
                value={name}
                placeholder={
                  show ? multiBuyData.name : "e.g. My Config Profile"
                }
                suffix={`${name.length}/25`}
                maxLength={25}
                disabled={!userCan({ role: currentRole })}
              />

              <div
                style={{
                  margin: "20px 0",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Switch
                  onChange={() => {
                    console.log("updating");
                  }}
                  checked={false} // TODO fix
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
                  onChange={() => {
                    console.log("updating");
                  }}
                  checked={false} // TODO fix
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
                    marginTop: 40,
                  }}
                  onClick={() => {
                    if (show) {
                      analyticsLogger.logEvent("ACTION_UPDATE_CONFIG_PROFILE", {
                        id,
                      });
                    } else {
                      analyticsLogger.logEvent("ACTION_CREATE_CONFIG_PROFILE", {
                        id,
                      });
                    }
                  }}
                >
                  {show ? "Update" : "Create"} Config Profile
                </Button>
              </UserCan>
            </Fragment>
          )}
        </Col>
      </Row>
    </div>
  );
};
