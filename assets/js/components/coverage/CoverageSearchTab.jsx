import React from "react";
import { Typography, Row, Col, Button } from "antd";
const { Text } = Typography;
import SearchOutlined from "@ant-design/icons/SearchOutlined";
import SelectedFlag from "../../../img/coverage/selected-flag.svg";
import { getColumns } from "./Constants";
import { updateOrganizationHotspot } from "../../actions/coverage";
import CoverageSearchTable from "./CoverageSearchTable";

export default ({
  data,
  term,
  searchTerm,
  updateSearchTerm,
  handleChangePageSize,
  handleSortChange,
  handleChangePage,
  onInputChange,
  storedSearchTerms,
  error,
  loading,
  ...props
}) => {
  const columns = getColumns(
    props,
    updateOrganizationHotspot,
    props.selectHotspotAddress
  );

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
            onKeyDown={onInputChange}
            onChange={onInputChange}
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
                        updateSearchTerm(t);
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
