import React, { useState, useEffect, useCallback } from "react";
import { Typography, Row, Col, Button } from "antd";
const { Text } = Typography;
import SearchOutlined from "@ant-design/icons/SearchOutlined";
import SelectedFlag from "../../../img/coverage/selected-flag.svg";
import { getColumns } from "./Constants";
import { updateOrganizationHotspot } from "../../actions/coverage";
import CoverageSearchTable from "./CoverageSearchTable";
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

export default ({ searchHotspots, data, error, loading, ...props }) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(startPageSize);
  const [column, setColumn] = useState(null);
  const [order, setOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [term, setTerm] = useState("");
  const [storedSearchTerms, setStoredSearchTerms] = useState(recentSearchTerms);

  const columns = getColumns(
    props,
    updateOrganizationHotspot,
    props.selectHotspotAddress
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
    if (!loading) {
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

  return (
    <React.Fragment>
      <div style={{ padding: 25 }}>
        <div style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 22, fontWeight: 600 }}>Hotspot Search</Text>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            background: "#F5F7F9",
            borderRadius: 4,
            padding: "4px 16px 4px 16px",
            marginBottom: 20,
          }}
        >
          <SearchOutlined style={{ color: "#8B9FC1", fontSize: 16 }} />
          <input
            style={{
              background: "none",
              border: "none",
              color: "#8B9FC1",
              fontSize: 15,
              lineHeight: 24,
              marginLeft: 10,
              height: 28,
              width: "90%",
            }}
            placeholder="Search by hotspot name or city"
            onKeyDown={(event) => {
              setTerm(event.target.value);
              if (event.key === "Enter") {
                setSearchTerm(event.target.value);
              }
            }}
            onChange={(event) => {
              setTerm(event.target.value);
              if (event.key === "Enter") {
                setSearchTerm(event.target.value);
              }
            }}
            value={term}
          />
        </div>

        {searchTerm.length === 0 && (
          <Row gutter={24}>
            <Col sm={12}>
              <Text style={{ fontSize: 16, fontWeight: 600 }}>
                Recent Searches
              </Text>
              {storedSearchTerms.length > 0 ? (
                storedSearchTerms.map((t) => (
                  <Row key={t}>
                    <Button
                      style={{ border: "none" }}
                      onClick={() => {
                        setTerm(t);
                        setSearchTerm(t);
                      }}
                    >
                      <Text
                        style={{
                          textDecoration: "underline",
                          color: "#1890ff",
                        }}
                      >
                        {t}
                      </Text>
                    </Button>
                  </Row>
                ))
              ) : (
                <Row>
                  <Text style={{ color: "grey" }}>
                    <i>No recent searches</i>
                  </Text>
                </Row>
              )}
            </Col>
            <Col sm={12}>
              <div style={{ marginBottom: 4 }}>
                <img
                  draggable="false"
                  src={SelectedFlag}
                  style={{
                    height: 16,
                    marginRight: 10,
                  }}
                />
                <Text style={{ fontSize: 16, fontWeight: 600 }}>
                  Flag to Mark
                </Text>
              </div>
              <Text>
                Any Hotspot in the network can be flagged, which adds it to your
                Organization's 'My Hotspots' tab.
              </Text>
            </Col>
          </Row>
        )}
      </div>
      {error && (
        <Text>Data failed to load, please reload the page and try again</Text>
      )}
      {searchTerm.length !== 0 && (
        <CoverageSearchTable
          hotspots={
            data
              ? data.searchHotspots
              : { entries: [], pageSize: 10, page: 1, totalEntries: 0 }
          }
          handleChangePageSize={handleChangePageSize}
          handleSortChange={handleSortChange}
          handleChangePage={handleChangePage}
          columns={columns}
          loading={loading}
        />
      )}
    </React.Fragment>
  );
};
