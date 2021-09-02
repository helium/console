import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import DashboardLayout from "../common/DashboardLayout";
import { useQuery, useLazyQuery } from "@apollo/client";
import {
  HOTSPOT_STATS,
  FOLLOWED_HOTSPOT_STATS,
  ALL_ORGANIZATION_HOTSPOTS,
  HOTSPOT_STATS_DEVICE_COUNT,
} from "../../graphql/coverage";
import Mapbox from "../common/Mapbox";
import CoverageMainTab from "./CoverageMainTab";
import CoverageFollowedTab from "./CoverageFollowedTab";
import CoverageSearchTab from "./CoverageSearchTab";
import CoverageHotspotShow from "./CoverageHotspotShow";
import { Typography, Tabs, Row, Col } from "antd";
import analyticsLogger from "../../util/analyticsLogger";
const { Text } = Typography;
const { TabPane } = Tabs;
import { SEARCH_HOTSPOTS } from "../../graphql/search";

export default (props) => {
  const [hotspotAddressSelected, selectHotspotAddress] = useState(null);
  const [currentTab, setCurrentTab] = useState("main");

  const {
    loading: hotspotStatsLoading,
    error: hotspotStatsError,
    data: hotspotStatsData,
    refetch: hotspotStatsRefetch,
  } = useQuery(HOTSPOT_STATS, {
    fetchPolicy: "cache-and-network",
  });

  const {
    loading: hotspotStatsDeviceCountLoading,
    error: hotspotStatsDeviceCountError,
    data: hotspotStatsDeviceCountData,
    refetch: hotspotStatsDeviceCountRefetch,
  } = useQuery(HOTSPOT_STATS_DEVICE_COUNT, {
    fetchPolicy: "cache-and-network",
  });

  const {
    loading: followedHotspotStatsLoading,
    error: followedHotspotStatsError,
    data: followedHotspotStatsData,
    refetch: followedHotspotStatsRefetch,
  } = useQuery(FOLLOWED_HOTSPOT_STATS, {
    fetchPolicy: "cache-and-network",
  });

  const {
    loading: allOrganizationHotspotsLoading,
    error: allOrganizationHotspotsError,
    data: allOrganizationHotspotsData,
    refetch: allOrganizationHotspotsRefetch,
  } = useQuery(ALL_ORGANIZATION_HOTSPOTS, {
    fetchPolicy: "cache-and-network",
  });

  const [
    searchHotspots,
    {
      loading: searchHotspotsLoading,
      error: searchHotspotsError,
      data: searchHotspotsData,
    },
  ] = useLazyQuery(SEARCH_HOTSPOTS, {
    fetchPolicy: "cache-and-network",
  });

  const socket = useSelector((state) => state.apollo.socket);
  const currentOrganizationId = useSelector(
    (state) => state.organization.currentOrganizationId
  );
  const orgHotspotsChannel = socket.channel(
    "graphql:coverage_index_org_hotspots",
    {}
  );

  useEffect(() => {
    // executed when mounted
    orgHotspotsChannel.join();
    orgHotspotsChannel.on(
      `graphql:coverage_index_org_hotspots:${currentOrganizationId}:org_hotspots_update`,
      (_message) => {
        allOrganizationHotspotsRefetch();
        followedHotspotStatsRefetch();
      }
    );
    // executed when unmounted
    return () => {
      orgHotspotsChannel.leave();
    };
  }, []);

  const orgHotspotsMap = allOrganizationHotspotsData
    ? allOrganizationHotspotsData.allOrganizationHotspots.reduce((acc, hs) => {
        acc[hs.hotspot_address] = hs;
        return acc;
      }, {})
    : {};

  const renderMap = () => {
    if (currentTab === "main") {
      if (hotspotStatsData && allOrganizationHotspotsData) {
        if (hotspotAddressSelected) {
          const selectedHotspot = hotspotStatsData.hotspotStats.filter(
            (h) => h.hotspot_address === hotspotAddressSelected
          );
          return (
            <Mapbox
              data={selectedHotspot}
              key={`${selectedHotspot.hotspot_address}`}
              allOrganizationHotspots={
                allOrganizationHotspotsData.allOrganizationHotspots
              }
              orgHotspotsMap={orgHotspotsMap}
            />
          );
        } else {
          return (
            <Mapbox
              data={hotspotStatsData.hotspotStats}
              key="main"
              allOrganizationHotspots={
                allOrganizationHotspotsData.allOrganizationHotspots
              }
              orgHotspotsMap={orgHotspotsMap}
            />
          );
        }
      }
    } else if (currentTab === "followed") {
      if (allOrganizationHotspotsData) {
        if (hotspotAddressSelected) {
          const selectedHotspot =
            allOrganizationHotspotsData.allOrganizationHotspots.filter(
              (h) => h.hotspot_address === hotspotAddressSelected
            );
          return (
            <Mapbox
              data={selectedHotspot}
              key={`${selectedHotspot.hotspot_address}`}
              allOrganizationHotspots={
                allOrganizationHotspotsData.allOrganizationHotspots
              }
              orgHotspotsMap={orgHotspotsMap}
            />
          );
        } else {
          return (
            <Mapbox
              data={followedHotspotStatsData.followedHotspotStats}
              key="followed"
              allOrganizationHotspots={
                allOrganizationHotspotsData.allOrganizationHotspots
              }
              orgHotspotsMap={orgHotspotsMap}
            />
          );
        }
      }
    } else if (currentTab === "search") {
      if (searchHotspotsData && allOrganizationHotspotsData) {
        if (hotspotAddressSelected) {
          const selectedHotspot =
            searchHotspotsData.searchHotspots.entries.filter(
              (h) => h.hotspot_address === hotspotAddressSelected
            );
          return (
            <Mapbox
              data={selectedHotspot}
              key={`${selectedHotspot.hotspot_address}`}
              allOrganizationHotspots={
                allOrganizationHotspotsData.allOrganizationHotspots
              }
              orgHotspotsMap={orgHotspotsMap}
            />
          );
        } else {
          return (
            <Mapbox
              data={searchHotspotsData.searchHotspots.entries || []}
              key="search"
              allOrganizationHotspots={
                allOrganizationHotspotsData.allOrganizationHotspots
              }
              orgHotspotsMap={orgHotspotsMap}
            />
          );
        }
      }
    }
  };

  return (
    <DashboardLayout title="Coverage" user={props.user} noAddButton full>
      <div
        style={{
          height: "90%",
          width: "100%",
          backgroundColor: "#ffffff",
          borderRadius: 6,
          overflow: "hidden",
          boxShadow: "0px 20px 20px -7px rgba(17, 24, 31, 0.19)",
        }}
      >
        <Row style={{ height: "100%" }}>
          <Col sm={14} style={{ height: "100%", overflow: "scroll" }}>
            <Tabs
              defaultActiveKey="main"
              size="large"
              tabBarStyle={{
                paddingLeft: 20,
                paddingRight: 20,
                height: 40,
                marginTop: 20,
              }}
              onTabClick={(tab) => {
                setCurrentTab(tab);
                selectHotspotAddress(null);
              }}
            >
              <TabPane tab="Coverage Breakdown" key="main">
                {!hotspotAddressSelected ? (
                  <CoverageMainTab
                    hotspotStats={
                      hotspotStatsData && hotspotStatsData.hotspotStats
                    }
                    deviceCount={
                      hotspotStatsDeviceCountData &&
                      hotspotStatsDeviceCountData.hotspotStatsDeviceCount
                    }
                    orgHotspotsMap={orgHotspotsMap}
                    selectHotspotAddress={selectHotspotAddress}
                  />
                ) : (
                  <CoverageHotspotShow
                    hotspotAddress={hotspotAddressSelected}
                    orgHotspotsMap={orgHotspotsMap}
                    selectHotspotAddress={selectHotspotAddress}
                  />
                )}
              </TabPane>
              <TabPane tab="My Hotspots" key="followed">
                {!hotspotAddressSelected ? (
                  <CoverageFollowedTab
                    hotspotStats={
                      followedHotspotStatsData &&
                      followedHotspotStatsData.followedHotspotStats
                    }
                    orgHotspotsMap={orgHotspotsMap}
                    selectHotspotAddress={selectHotspotAddress}
                  />
                ) : (
                  <CoverageHotspotShow
                    hotspotAddress={hotspotAddressSelected}
                    orgHotspotsMap={orgHotspotsMap}
                    selectHotspotAddress={selectHotspotAddress}
                  />
                )}
              </TabPane>
              <TabPane tab="Hotspot Search" key="search">
                {!hotspotAddressSelected ? (
                  <CoverageSearchTab
                    orgHotspotsMap={orgHotspotsMap}
                    selectHotspotAddress={selectHotspotAddress}
                    data={searchHotspotsData}
                    loading={searchHotspotsLoading}
                    error={searchHotspotsError}
                    searchHotspots={searchHotspots}
                  />
                ) : (
                  <CoverageHotspotShow
                    hotspotAddress={hotspotAddressSelected}
                    orgHotspotsMap={orgHotspotsMap}
                    selectHotspotAddress={selectHotspotAddress}
                  />
                )}
              </TabPane>
            </Tabs>
          </Col>
          <Col sm={10}>{renderMap()}</Col>
        </Row>
      </div>
    </DashboardLayout>
  );
};
