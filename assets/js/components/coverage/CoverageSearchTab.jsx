import React, { useEffect, useState } from "react";
import { Typography, Row, Col } from "antd";
const { Text } = Typography;
import SearchOutlined from "@ant-design/icons/SearchOutlined";
import SelectedFlag from "../../../img/coverage/selected-flag.svg";
import { SEARCH_HOTSPOTS } from "../../graphql/search";
import { useQuery } from "@apollo/client";
import debounce from "lodash/debounce";
const PAGE_SIZE_KEY = "hotspotSearchPageSize";
let startPageSize = parseInt(localStorage.getItem(PAGE_SIZE_KEY)) || 10;
import { SkeletonLayout } from "../common/SkeletonLayout";
import { getColumns } from "./Constants";
import { updateOrganizationHotspot } from "../../actions/coverage";
import CoverageSearchTable from "./CoverageSearchTable";

export default (props) => {
  const columns = getColumns(props, updateOrganizationHotspot);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(startPageSize);
  const [column, setColumn] = useState(null);
  const [order, setOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { loading, error, data, refetch } = useQuery(SEARCH_HOTSPOTS, {
    fetchPolicy: "cache-and-network",
    variables: { query: searchTerm, page, pageSize, column, order },
  });

  const runSearch = () => {
    if (!loading) {
      refetch({ searchTerm, page, pageSize, column, order });
    }
  };

  const debouncedSearch = debounce(runSearch, 300);

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm]);

  const handleChangePageSize = (pageSize) => {
    setPageSize(pageSize);
    localStorage.setItem(PAGE_SIZE_KEY, pageSize);
    refetch({ searchTerm, page, pageSize, column, order });
  };

  const handleSortChange = (column, order) => {
    setColumn(column);
    setOrder(order);
    refetch({ searchTerm, page, pageSize, column, order });
  };

  const handleChangePage = (page) => {
    setPage(page);
    refetch({ searchTerm, page, pageSize, column, order });
  };

  return (
    <div>
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
            marginBottom: 32,
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
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {searchTerm.length === 0 && (
          <Row gutter={24}>
            <Col sm={12}>
              <Text style={{ fontSize: 16, fontWeight: 600 }}>
                Recent Searches
              </Text>
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
        {error && (
          <Text>Data failed to load, please reload the page and try again</Text>
        )}
        {searchTerm.length !== 0 && (
          <CoverageSearchTable
            hotspots={
              data
                ? data.hotspots
                : { entries: [], pageSize: 10, page: 1, totalEntries: 0 }
            }
            handleChangePageSize={handleChangePageSize}
            handleSortChange={handleSortChange}
            handleChangePage={handleChangePage}
            columns={columns}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};
