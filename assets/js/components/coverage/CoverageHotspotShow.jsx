import React, { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import OutsideClick from "react-outside-click-handler";
import { useLazyQuery } from "@apollo/client";
import analyticsLogger from "../../util/analyticsLogger";
import { Typography, Row, Col, Button, Tooltip, Input, Tabs } from "antd";
const { TabPane } = Tabs;
const { Text } = Typography;
import ArrowLeftOutlined from "@ant-design/icons/ArrowLeftOutlined";
import BugOutlined from "@ant-design/icons/BugOutlined";
import { HOTSPOT_SHOW } from "../../graphql/coverage";
import Debug from "../common/Debug";
import Sidebar from "../common/Sidebar";
import CoverageHotspotShowDevicesTab from "./CoverageHotspotShowDevicesTab";
import CoverageHotspotShowStatsTab from "./CoverageHotspotShowStatsTab";
import startCase from "lodash/startCase";
import { renderStatusLabel } from "./Constants";
import {
  followHotspot,
  preferHotspot,
  updateHotspotAlias,
} from "../../actions/coverage";
import SelectedFlag from "../../../img/coverage/selected-flag.svg";
import PreferredFlag from "../../../img/coverage/preferred-flag.svg";
import UnselectedFlag from "../../../img/coverage/unselected-flag.svg";
import LocationIcon from "../../../img/coverage/hotspot-show-location-icon.svg";
import AliasIcon from "../../../img/coverage/hotspot-show-alias-icon.svg";
import { debugSidebarBackgroundColor } from "../../util/colors";
import ConfirmHotspotUnfollowModal from "./ConfirmHotspotUnfollowModal";

export default (props) => {
  const [getHotspot, { error, loading, data, refetch }] =
    useLazyQuery(HOTSPOT_SHOW);
  const [name, setName] = useState("");
  const [showAliasInput, toggleAliasInput] = useState(false);
  const [showDebugSidebar, setShowDebugSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState("stats");
  const [showConfirmUnfollowModal, setShowConfirmUnfollowModal] =
    useState(false);
  const [hotspotToUnfollow, setHotspotToUnfollow] = useState([]);

  const warnUnfollow = (hotspotToUnfollow) => {
    setShowConfirmUnfollowModal(true);
    setHotspotToUnfollow(hotspotToUnfollow);
  };

  useEffect(() => {
    getHotspot({
      fetchPolicy: "cache-and-network",
      variables: { address: props.hotspotAddress },
    });
  }, [props.hotspotAddress]);

  if (error || loading || !data)
    return <div style={{ padding: 25, paddingTop: 8 }} />;

  const hotspot = data.hotspot;
  const orgHotspot = props.orgHotspotsMap[hotspot.hotspot_address];
  const hotspotClaimed = orgHotspot ? orgHotspot.claimed : false;
  const hotspotPreferred = orgHotspot ? orgHotspot.preferred : false;
  const hotspotAlias = orgHotspot ? orgHotspot.alias : null;

  const handleToggleDebug = () => {
    if (!showDebugSidebar) {
      analyticsLogger.logEvent("ACTION_OPEN_HOTSPOT_SHOW_DEBUG", {
        address: hotspot.hotspot_address,
      });
    } else {
      analyticsLogger.logEvent("ACTION_CLOSE_HOTSPOT_SHOW_DEBUG", {
        address: hotspot.hotspot_address,
      });
    }
    setShowDebugSidebar(!showDebugSidebar);
  };

  return (
    <Fragment>
      <div style={{ padding: 25, paddingTop: 8 }}>
        <Button
          icon={<ArrowLeftOutlined style={{ fontSize: 12 }} />}
          style={{
            border: "none",
            padding: 0,
            fontSize: 14,
            color: "#bfbfbf",
            height: 24,
          }}
          onClick={() => props.selectHotspotAddress(null)}
        >
          Back
        </Button>

        <Row gutter={12}>
          <Col sm={20}>
            <div
              style={{
                marginBottom: 8,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 22, fontWeight: 600, marginRight: 20 }}>
                {startCase(hotspot.hotspot_name)}
              </Text>
              {renderStatusLabel(hotspot.status)}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  color: "#2C79EE",
                  marginRight: 20,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <img
                  draggable="false"
                  src={LocationIcon}
                  style={{ height: 12, marginRight: 4 }}
                />
                {locationString(
                  hotspot.long_city,
                  hotspot.short_state,
                  hotspot.short_country
                )}
              </span>
              {showAliasInput ? (
                <OutsideClick
                  onOutsideClick={() => {
                    toggleAliasInput(false);
                    updateHotspotAlias(hotspot.hotspot_address, name);
                  }}
                >
                  <Input
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: 200,
                      verticalAlign: "middle",
                    }}
                    suffix={`${name.length}/50`}
                    maxLength={50}
                  />
                </OutsideClick>
              ) : (
                <Link
                  to="#"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleAliasInput(true);
                    setName(hotspotAlias || "");
                  }}
                >
                  <span
                    style={{
                      color: "#2C79EE",
                      marginRight: 20,
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <img
                      draggable="false"
                      src={AliasIcon}
                      style={{ height: 12, marginRight: 4 }}
                    />
                    <Tooltip title="Click to Edit Alias">
                      {hotspotAlias || "No Alias"}
                    </Tooltip>
                  </span>
                </Link>
              )}
            </div>
            <div style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 16 }}>
                This Hotspot has heard from {hotspot.device_count || "none"} of
                your devices over the past 24 hours.
              </Text>
            </div>
          </Col>
          <Col sm={4}>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-end",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Link
                  to="#"
                  onClick={() => {
                    if (hotspotClaimed && !hotspotPreferred) {
                      preferHotspot(hotspot.hotspot_address, true);
                    } else {
                      if (
                        hotspotClaimed &&
                        props.preferredHotspotAddresses.filter(
                          (pha) => pha !== hotspot.hotspot_address
                        ).length === 0
                      ) {
                        warnUnfollow(hotspot.hotspot_address);
                      } else {
                        followHotspot(hotspot.hotspot_address, !hotspotClaimed);
                      }
                    }
                  }}
                >
                  <img
                    draggable="false"
                    src={
                      hotspotClaimed
                        ? hotspotPreferred
                          ? PreferredFlag
                          : SelectedFlag
                        : UnselectedFlag
                    }
                    style={{
                      height: 20,
                      marginBottom: 8,
                    }}
                  />
                </Link>
                <div
                  style={{
                    backgroundColor: hotspotClaimed
                      ? hotspotPreferred
                        ? "#2BCC4F26"
                        : "#2C79EE26"
                      : "#F5F7F9",
                    borderRadius: 10,
                    padding: "4px 8px 4px 8px",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: hotspotClaimed
                        ? hotspotPreferred
                          ? "#2BCC4F"
                          : "#2C79EE"
                        : "#acbccc",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {hotspotClaimed
                      ? hotspotPreferred
                        ? "Preferred"
                        : "Followed!"
                      : "Not Followed"}
                  </Text>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <Tabs
        activeKey={activeTab}
        size="large"
        tabBarStyle={{
          paddingLeft: 20,
          paddingRight: 20,
          height: 40,
        }}
        onTabClick={(tab) => {
          if (tab !== "debug") setActiveTab(tab);
          else handleToggleDebug();
        }}
      >
        <TabPane tab="Statistics" key="stats">
          <CoverageHotspotShowStatsTab hotspot={hotspot} />
        </TabPane>
        <TabPane tab="My Devices Heard" key="devicesTable">
          <CoverageHotspotShowDevicesTab hotspot={hotspot} />
        </TabPane>
        <TabPane tab="Debug" key="debug" />
      </Tabs>

      <Sidebar
        show={showDebugSidebar}
        toggle={handleToggleDebug}
        sidebarIcon={<BugOutlined />}
        iconBackground={debugSidebarBackgroundColor}
        from="hotspotShow"
        message="Access Debug mode to view hotspot packet transfer"
      >
        <Debug hotspotAddress={hotspot.hotspot_address} entryWidth={600} />
      </Sidebar>
      <ConfirmHotspotUnfollowModal
        open={showConfirmUnfollowModal}
        close={() => {
          setShowConfirmUnfollowModal(false);
        }}
        submit={() => {
          followHotspot(hotspotToUnfollow, false).then(() => {
            setShowConfirmUnfollowModal(false);
          });
        }}
        multiple={false}
      />
    </Fragment>
  );
};

const locationString = (long_city, short_state, short_country) => {
  if (long_city && short_country && short_state) {
    return long_city + ", " + short_state + ", " + short_country;
  }
  if (!long_city && short_country) {
    return short_country;
  }
  return "Unknown Location";
};
