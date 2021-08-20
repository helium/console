import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import DashboardLayout from "../common/DashboardLayout";
import { useQuery } from "@apollo/client";
<<<<<<< HEAD
import {
  HOTSPOT_STATS,
  ALL_ORGANIZATION_HOTSPOTS,
  HOTSPOT_STATS_DEVICE_COUNT,
} from "../../graphql/coverage";
=======
import { HOTSPOT_STATS, FOLLOWED_HOTSPOT_STATS, ALL_ORGANIZATION_HOTSPOTS, HOTSPOT_STATS_DEVICE_COUNT } from "../../graphql/coverage";
>>>>>>> 54cde903e3f4e2ca93b14c1d3a7bf3b8a2c7372b
import Mapbox from "../common/Mapbox";
import CoverageMainTab from "./CoverageMainTab";
import CoverageFollowedTab from "./CoverageFollowedTab";
import CoverageSearchTab from "./CoverageSearchTab";
import { Typography, Tabs, Row, Col } from "antd";
import analyticsLogger from "../../util/analyticsLogger";
const { Text } = Typography;
const { TabPane } = Tabs;

export default (props) => {
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
    refetch: followedHotspotStatsRefetch
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
        acc[hs.hotspot_address] = true;
        return acc;
      }, {})
    : {};

  return (
    <DashboardLayout title="Coverage" user={props.user} noAddButton>
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
        <Row>
          <Col sm={14}>
            <Tabs
              defaultActiveKey="main"
              size="large"
              tabBarStyle={{
                paddingLeft: 20,
                paddingRight: 20,
                height: 40,
                marginTop: 20,
              }}
            >
              <TabPane tab="Coverage Breakdown" key="main">
                <CoverageMainTab
                  hotspotStats={
                    hotspotStatsData && hotspotStatsData.hotspotStats
                  }
                  orgHotspotsMap={orgHotspotsMap}
                  deviceCount={
                    hotspotStatsDeviceCountData &&
                    hotspotStatsDeviceCountData.hotspotStatsDeviceCount
                  }
                />
              </TabPane>
              <TabPane tab="My Hotspots" key="followed">
                <CoverageFollowedTab
                  hotspotStats={followedHotspotStatsData && followedHotspotStatsData.followedHotspotStats}
                  orgHotspotsMap={orgHotspotsMap}
                />
              </TabPane>
              <TabPane tab="Hotspot Search" key="search">
                <CoverageSearchTab orgHotspotsMap={orgHotspotsMap} />
              </TabPane>
            </Tabs>
          </Col>
          <Col sm={10}>
            <Mapbox />
          </Col>
        </Row>
      </div>
    </DashboardLayout>
  );
};
