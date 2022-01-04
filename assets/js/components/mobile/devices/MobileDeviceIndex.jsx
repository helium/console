import React, { useState, useEffect, useCallback } from "react";
import { SkeletonLayout } from "../../common/SkeletonLayout";
import { Typography, Input } from "antd";
import { useLazyQuery } from "@apollo/client";
import MobileDeviceTableRow from "./MobileDeviceTableRow";
import MobileDeviceIndexLabelsBar from "./MobileDeviceIndexLabelsBar";
import useElementOnScreen from "../ElementOnScreen.jsx";
import MobileAddResourceButton from "../../common/MobileAddResourceButton";
const { Text } = Typography;
import { useHistory } from "react-router-dom";
import SearchOutlined from "@ant-design/icons/SearchOutlined";
import { SEARCH_DEVICES_MOBILE } from "../../../graphql/search";
import debounce from "lodash/debounce";
import ErrorMessage from "../../common/ErrorMessage";

export default ({ loading, devices, refetch }) => {
  const history = useHistory();
  const [searchTerm, setSearchTerm] = useState("");
  const [
    searchDevicesMobile,
    {
      loading: searchDevicesMobileLoading,
      error: searchDevicesMobileError,
      data: searchDevicesMobileData,
    },
  ] = useLazyQuery(SEARCH_DEVICES_MOBILE, {
    fetchPolicy: "cache-and-network",
  });

  const searchDevices = searchDevicesMobileData
    ? searchDevicesMobileData.searchDevicesMobile
    : [];

  const runSearch = () => {
    if (!searchDevicesMobileLoading) {
      searchDevicesMobile({
        variables: { query: searchTerm },
      });
    }
  };

  const debouncedSearch = useCallback(
    debounce(() => {
      runSearch();
    }, 800)
  );

  const [containerRef] = useElementOnScreen(
    {
      root: null,
      rootMargin: "0px",
      threshold: 1.0,
    },
    refetch,
    devices
  );

  useEffect(() => {
    debouncedSearch();
  }, [searchTerm]);

  return (
    <div>
      <div style={{ padding: 15 }}>
        <Text style={{ fontSize: 32, fontWeight: 600 }}>My Devices</Text>
        <Input
          name="searchTerm"
          onChange={(e) => {
            setSearchTerm(e.target.value);
          }}
          placeholder="Search Devices..."
          prefix={<SearchOutlined style={{ color: "lightgray" }} />}
          maxLength={50}
          style={{ border: "none", borderRadius: 50, margin: "8px 0px" }}
        />
      </div>

      <MobileDeviceIndexLabelsBar
        push={history.push}
        pathname={history.location.pathname}
      />

      {(loading || (searchTerm && searchDevicesMobileLoading)) && (
        <SkeletonLayout />
      )}
      {(searchTerm
        ? searchDevices &&
          !searchDevicesMobileLoading &&
          !searchDevicesMobileError
        : devices) && (
        <div style={{ marginBottom: 15 }}>
          {!loading && (!searchTerm || !searchDevicesMobileLoading) && (
            <Text
              style={{
                marginLeft: 15,
                marginBottom: 10,
                fontWeight: 600,
                fontSize: 16,
                display: "block",
              }}
            >
              {searchTerm ? searchDevices.length : devices.totalEntries} Devices
            </Text>
          )}
          {(searchTerm && !searchDevicesMobileError
            ? searchDevices
            : devices.entries
          ).map((device) => (
            <MobileDeviceTableRow
              key={device.id}
              device={device}
              push={history.push}
            />
          ))}
          {searchDevicesMobileError && <ErrorMessage />}
          {!searchTerm && <div style={{ height: 1 }} ref={containerRef} />}
        </div>
      )}

      <MobileAddResourceButton />
    </div>
  );
};
