import React, { useState, useEffect, useCallback } from "react";
import { SkeletonLayout } from "../../common/SkeletonLayout";
import { Typography, Input } from "antd";
import MobileTableRow from "../../common/MobileTableRow";
import useElementOnScreen from "../ElementOnScreen.jsx";
const { Text } = Typography;
import MenuCaret from "../../../../img/menu-caret.svg";
import MobileAddResourceButton from "../../common/MobileAddResourceButton";
import { useHistory } from "react-router-dom";
import SearchOutlined from "@ant-design/icons/SearchOutlined";
import { SEARCH_CHANNELS_MOBILE } from "../../../graphql/search";
import { useLazyQuery } from "@apollo/client";
import debounce from "lodash/debounce";
import ErrorMessage from "../../common/ErrorMessage";

export default ({ loading, channels, refetch }) => {
  const history = useHistory();
  const [searchTerm, setSearchTerm] = useState("");
  const [
    searchChannelsMobile,
    {
      loading: searchChannelsMobileLoading,
      error: searchChannelsMobileError,
      data: searchChannelsMobileData,
    },
  ] = useLazyQuery(SEARCH_CHANNELS_MOBILE, {
    fetchPolicy: "cache-and-network",
  });

  const searchChannels = searchChannelsMobileData
    ? searchChannelsMobileData.searchChannelsMobile
    : [];

  const runSearch = () => {
    if (!searchChannelsMobileLoading) {
      searchChannelsMobile({
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
    channels
  );

  useEffect(() => {
    debouncedSearch();
  }, [searchTerm]);

  return (
    <div>
      <div style={{ padding: 15 }}>
        <Text style={{ fontSize: 32, fontWeight: 600 }}>Integrations</Text>
        <Input
          name="searchTerm"
          onChange={(e) => {
            setSearchTerm(e.target.value);
          }}
          placeholder="Search Integrations..."
          prefix={<SearchOutlined style={{ color: "lightgray" }} />}
          maxLength={50}
          style={{ border: "none", borderRadius: 50, margin: "8px 0px" }}
        />
      </div>
      {(loading || (searchTerm && searchChannelsMobileLoading)) && (
        <SkeletonLayout />
      )}
      {(searchTerm
        ? searchChannels &&
          !searchChannelsMobileLoading &&
          !searchChannelsMobileError
        : channels) && (
        <div style={{ marginBottom: 15 }}>
          {!loading && (!searchTerm || !searchChannelsMobileLoading) && (
            <Text
              style={{
                marginLeft: 15,
                marginBottom: 10,
                fontWeight: 600,
                fontSize: 16,
                display: "block",
              }}
            >
              {searchTerm ? searchChannels.length : channels.totalEntries}{" "}
              Integrations
            </Text>
          )}
          {(searchTerm && !searchChannelsMobileError
            ? searchChannels
            : channels.entries
          ).map((channel) => (
            <MobileTableRow
              id={channel.id}
              key={channel.id}
              mainTitle={channel.name}
              subtext={channel.type_name}
              onClick={() => {
                history.push(`/integrations/${channel.id}`);
              }}
              rightAction={
                <span>
                  <Text style={{ fontSize: 16 }} strong>
                    {channel.number_devices} Device
                    {channel.number_devices === 0 || channel.number_devices > 1
                      ? "s"
                      : ""}
                  </Text>
                  <img src={MenuCaret} style={{ marginLeft: 25, height: 12 }} />
                </span>
              }
            />
          ))}
          {searchChannelsMobileError && <ErrorMessage />}
          {!searchTerm && <div style={{ height: 1 }} ref={containerRef} />}
        </div>
      )}

      <MobileAddResourceButton />
    </div>
  );
};
