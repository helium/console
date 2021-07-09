import React, { useEffect } from "react";
import DashboardLayout from "../common/DashboardLayout";
import NavPointTriangle from "../common/NavPointTriangle";
import AddResourceButton from "../common/AddResourceButton";
import { Typography, Row, Col } from "antd";
import CFListIcon from "../../../img/cf-list/cf-list-icon.svg";
import CFListAllIcon from "../../../img/cf-list/cf-list-icon-all.svg";
import analyticsLogger from "../../util/analyticsLogger";
const { Text } = Typography;

export const cfListText1 = `
  The Join-Accept CF List configures channels according to 
  the LoRaWAN spec to use sub-band 2. Devices that have not correctly implemented the 
  LoRaWAN spec may experience transfer issues when this setting is enabled.
`;

export const cfListText2 =
  "- Enabled, the server will send a CF List with every other join.";

export const cfListText3 =
  "- Disabled, the server will not send a CF List. The channel mask is still transmitted via ADR command.";

export default (props) => {
  useEffect(() => {
    analyticsLogger.logEvent("ACTION_NAV_CF_LIST_INDEX");
  }, []);
  return (
    <DashboardLayout title="Join-Accept CF List" user={props.user}>
      <div
        style={{
          height: "100%",
          width: "100%",
          backgroundColor: "#ffffff",
          borderRadius: 6,
          overflow: "hidden",
          boxShadow: "0px 20px 20px -7px rgba(17, 24, 31, 0.19)",
        }}
      >
        <div
          style={{
            padding: 20,
            backgroundColor: "#D3E0EE",
            display: "flex",
            flexDirection: "row",
            overflowX: "scroll",
          }}
        >
          <div
            style={{
              backgroundColor: "#2C79EE",
              borderRadius: 25,
              padding: "5px 10px 5px 10px",
              cursor: "pointer",
              height: 50,
              width: 160,
              minWidth: 160,
              display: "flex",
              flexDirection: "column",
              marginRight: 12,
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                height: "100px",
              }}
            >
              <img
                src={CFListAllIcon}
                style={{
                  height: 12,
                  marginRight: 12,
                  position: "relative",
                  top: -4,
                }}
              />
              <div>
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    display: "block",
                  }}
                >
                  CF List Enabled
                </Text>
                <Text
                  style={{
                    color: "#FFFFFF",
                    whiteSpace: "nowrap",
                    position: "relative",
                    top: -4,
                    fontSize: 10,
                  }}
                >
                  CF List
                </Text>
              </div>
            </div>
            <NavPointTriangle />
          </div>
        </div>

        <div style={{ overflowX: "scroll" }} className="no-scroll-bar">
          <Row gutter={30} style={{ padding: 30, minWidth: 700 }}>
            <Col span={12}>
              <div style={{ padding: 20 }}>
                <img
                  src={CFListIcon}
                  style={{
                    position: "relative",
                    top: -4,
                    marginBottom: 10,
                  }}
                />
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    display: "block",
                    marginBottom: 10,
                  }}
                >
                  Join-Accept CF List
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: 300,
                    display: "block",
                    marginBottom: 5,
                  }}
                >
                  {cfListText1}
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    display: "block",
                    marginBottom: 5,
                  }}
                >
                  {cfListText2}
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    display: "block",
                    marginBottom: 10,
                  }}
                >
                  {cfListText3}
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: 400,
                    display: "block",
                    marginBottom: 15,
                  }}
                >
                  Note: This setting is only applicable to US915 devices.
                </Text>
                {/* <a
                  className="help-link"
                  target="_blank"
                  href="https://docs.helium.com/use-the-network/console/"
                >
                  Learn more about CF List
                </a> */}
              </div>
            </Col>
            <Col span={12}></Col>
          </Row>
        </div>
      </div>

      <AddResourceButton />
    </DashboardLayout>
  );
};
