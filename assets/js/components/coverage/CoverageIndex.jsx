import React, { useState, useEffect, useCallback } from "react";
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
import debounce from "lodash/debounce";
const PAGE_SIZE_KEY = "hotspotSearchPageSize";
let startPageSize = parseInt(localStorage.getItem(PAGE_SIZE_KEY)) || 10;
const RECENT_HOTSPOT_SEARCH_TERMS = "recentHotspotSearchTerms";
let recentSearchTerms;
try {
  recentSearchTerms =
    JSON.parse(localStorage.getItem(RECENT_HOTSPOT_SEARCH_TERMS)) || [];
} catch (e) {
  recentSearchTerms = [];
}

export default (props) => {
  const [hotspotAddressSelected, selectHotspotAddress] = useState(null);
  const [currentTab, setCurrentTab] = useState("main");

  // for paginated search page
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(startPageSize);
  const [column, setColumn] = useState(null);
  const [order, setOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [term, setTerm] = useState("");
  const [storedSearchTerms, setStoredSearchTerms] = useState(recentSearchTerms);

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

  const handleChangePageSize = (pageSize) => {
    setPageSize(pageSize);
    localStorage.setItem(PAGE_SIZE_KEY, pageSize);
    searchHotspots({
      variables: { query: searchTerm, page, pageSize, column, order },
    });
  };

  const handleSortChange = (column, order) => {
    setColumn(column);
    setOrder(order);
    searchHotspots({
      variables: { query: searchTerm, page, pageSize, column, order },
    });
  };

  const handleChangePage = (page) => {
    setPage(page);
    searchHotspots({
      variables: { query: searchTerm, page, pageSize, column, order },
    });
  };

  const storeTerm = () => {
    if (searchTerm !== "") {
      let modifiedTerms = storedSearchTerms;

      /* if case-insensitive searchTerm already exists,
      remove so that searchTerm can be added to index 0 */
      var query = searchTerm.toLowerCase();
      var index = -1;
      modifiedTerms.some(function (element, i) {
        if (query === element.toLowerCase()) {
          index = i;
          return true;
        }
      });
      if (index !== -1) modifiedTerms.splice(index, 1);

      if (recentSearchTerms.length === 10) modifiedTerms.pop(); // store max 10 terms
      modifiedTerms.unshift(searchTerm);
      setStoredSearchTerms(modifiedTerms);
      localStorage.setItem(
        RECENT_HOTSPOT_SEARCH_TERMS,
        JSON.stringify(modifiedTerms)
      );
    }
  };

  const runSearch = () => {
    if (!searchHotspotsLoading) {
      searchHotspots({
        variables: { query: searchTerm, page, pageSize, column, order },
      });
      storeTerm();
    }
  };

  const debouncedSearch = useCallback(
    debounce(() => {
      runSearch();
    }, 800)
  );

  useEffect(() => {
    debouncedSearch();
  }, [searchTerm]);

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
      if (hotspotStatsData) {
        if (hotspotAddressSelected) {
          const selectedHotspot = hotspotStatsData.hotspotStats.filter(
            (h) => h.hotspot_address === hotspotAddressSelected
          );
          return (
            <Mapbox
              data={selectedHotspot}
              key={`${selectedHotspot.hotspot_address}`}
            />
          );
        } else {
          return <Mapbox data={hotspotStatsData.hotspotStats} key="main" />;
        }
      }
    } else if (currentTab === "followed") {
      if (followedHotspotStatsData) {
        if (hotspotAddressSelected) {
          const selectedHotspot =
            followedHotspotStatsData.followedHotspotStats.filter(
              (h) => h.hotspot_address === hotspotAddressSelected
            );
          return (
            <Mapbox
              data={selectedHotspot}
              key={`${selectedHotspot.hotspot_address}`}
            />
          );
        } else {
          return (
            <Mapbox
              data={followedHotspotStatsData.followedHotspotStats}
              key="followed"
            />
          );
        }
      }
    } else if (currentTab === "search") {
      if (searchHotspotsData) {
        if (hotspotAddressSelected) {
          const selectedHotspot =
            searchHotspotsData.searchHotspots.entries.filter(
              (h) => h.hotspot_address === hotspotAddressSelected
            );
          return (
            <Mapbox
              data={selectedHotspot}
              key={`${selectedHotspot.hotspot_address}`}
            />
          );
        } else {
          return (
            <Mapbox
              data={searchHotspotsData.searchHotspots.entries || []}
              key="search"
            />
          );
        }
      }
    }
  };

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
                    handleChangePageSize={handleChangePageSize}
                    handleSortChange={handleSortChange}
                    handleChangePage={handleChangePage}
                    data={searchHotspotsData}
                    onInputChange={(event) => {
                      setTerm(event.target.value);
                      if (event.key === "Enter") {
                        setSearchTerm(event.target.value);
                      }
                    }}
                    searchTerm={searchTerm}
                    updateSearchTerm={(value) => {
                      setTerm(value);
                      setSearchTerm(value);
                    }}
                    loading={searchHotspotsLoading}
                    error={searchHotspotsError}
                    storedSearchTerms={storedSearchTerms}
                    term={term}
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
