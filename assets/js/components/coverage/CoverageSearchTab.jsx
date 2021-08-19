import React, { useEffect, useState } from "react";
import { Typography, Row, Col, Table, Select, Pagination } from "antd";
const { Option } = Select;
const { Text } = Typography;
import SearchOutlined from "@ant-design/icons/SearchOutlined";
import SelectedFlag from "../../../img/coverage/selected-flag.svg";
import { SEARCH_HOTSPOTS } from "../../graphql/search";
import { useQuery } from "@apollo/client";
import debounce from "lodash/debounce";
const PAGE_SIZE_KEY = "hotspotSearchPageSize";
let startPageSize = parseInt(localStorage.getItem(PAGE_SIZE_KEY)) || 10;
import { minWidth } from "../../util/constants";
import { SkeletonLayout } from "../common/SkeletonLayout";
import { getColumns } from "./Constants";
import { updateOrganizationHotspot } from "../../actions/coverage";

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
      refetch();
    }
  };

  const debouncedSearch = debounce(runSearch, 300);

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm]);

  const handleChangePageSize = (pageSize) => {
    setPageSize(pageSize);
    localStorage.setItem(PAGE_SIZE_KEY, pageSize);
    refetch();
  };

  const handleSortChange = (column, order) => {
    setColumn(column);
    setOrder(order);
    refetch();
  };

  const handleChangePage = (page) => {
    setPage(page);
    refetch();
  };

  console.log(data);

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

        {searchTerm.length === 0 ? (
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
        ) : loading || !data ? (
          <div style={{ padding: 10 }}>
            <SkeletonLayout />
          </div>
        ) : (
          <React.Fragment>
            <Table
              showSorterTooltip={false}
              sortDirections={["descend", "ascend", "descend"]}
              rowKey={(record) => record.hotspot_address}
              dataSource={data && data.hotspots && data.hotspots.entries}
              columns={columns}
              pagination={false}
              onChange={(pagi, filter, sorter) => {
                handleSortChange(
                  sorter.field === "location" ? "long_city" : sorter.field,
                  sorter.order === "descend" ? "desc" : "asc"
                );
              }}
              style={{ minWidth, overflowX: "scroll", overflowY: "hidden" }}
              className="no-scroll-bar"
            />
            <div
              style={{
                minWidth,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
                paddingBottom: 0,
              }}
            >
              <Select
                value={`${
                  data && data.hotspots && data.hotspots.pageSize
                } results`}
                onSelect={handleChangePageSize}
                style={{ marginRight: 40, paddingTop: 2 }}
              >
                <Option value={10}>10</Option>
                <Option value={25}>25</Option>
                <Option value={100}>100</Option>
              </Select>
              <Pagination
                current={data && data.hotspots && data.hotspots.pageNumber}
                pageSize={data && data.hotspots && data.hotspots.pageSize}
                total={data && data.hotspots && data.hotspots.totalEntries}
                onChange={(page) => handleChangePage(page)}
                style={{ marginBottom: 20 }}
                showSizeChanger={false}
              />
            </div>
          </React.Fragment>
        )}
      </div>
    </div>
  );
};
