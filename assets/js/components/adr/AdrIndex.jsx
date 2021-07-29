import React, { useEffect } from "react";
import DashboardLayout from "../common/DashboardLayout";
import NavPointTriangle from "../common/NavPointTriangle";
import AddResourceButton from "../common/AddResourceButton";
import HomeIcon from "../../../img/adr/adr-all-icon.svg";
import AdrIcon from "../../../img/adr/adr-logo-icon.svg";
import { Typography, Row, Col } from "antd";
import analyticsLogger from "../../util/analyticsLogger";
const { Text } = Typography;

export const adrText1 =
  "ADR allows devices to use an optimal data rate which reduces power consumption and airtime on the network based on RF conditions. When ADR is disabled the channel mask is still transmitted via ADR command, but power output and data rates are not impacted. ";
export const adrText2 =
  "Recommended: only use ADR for fixed or non-mobile devices to ensure reliable connectivity.";

export default (props) => {
  useEffect(() => {
    analyticsLogger.logEvent("ACTION_NAV_ADR_INDEX");
  }, []);
  return (
    <DashboardLayout title="Adaptive Data Rates" user={props.user}>
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
              width: 120,
              minWidth: 120,
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
                src={HomeIcon}
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
                  ADR On
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
                  ADR
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
                  src={AdrIcon}
                  style={{ height: 50, display: "block", marginBottom: 10 }}
                />
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    display: "block",
                    marginBottom: 10,
                  }}
                >
                  Adaptive Data Rate
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: 400,
                    display: "block",
                    marginBottom: 15,
                  }}
                >
                  Adaptive Data Rate (ADR) needs to be requested by a device for
                  this setting to have an effect.
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: 300,
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  {adrText1}
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: 400,
                    display: "block",
                    marginBottom: 15,
                  }}
                >
                  {adrText2}
                </Text>
                <a
                  className="help-link"
                  target="_blank"
                  href="https://docs.helium.com/use-the-network/console/adr#adr"
                >
                  Learn more about ADR
                </a>
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
