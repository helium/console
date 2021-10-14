import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Table, Typography, Row, Col, Pagination } from "antd";
import {
  updateOrganizationHotspot,
  updateOrganizationHotspots,
} from "../../actions/coverage";
import { ClaimButton, UnclaimButton, getColumns } from "./Constants";
const { Text } = Typography;
import SelectedFlag from "../../../img/coverage/selected-flag.svg";
import UserCan from "../common/UserCan";

export default (props) => {
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const [column, setColumn] = useState("packet_count");
  const [order, setOrder] = useState("desc");
  const [selectedRows, setSelectedRows] = useState([]);
  const [allSelected, setAllSelected] = useState(false);

  const columns = getColumns(
    props,
    updateOrganizationHotspot,
    props.selectHotspotAddress
  );

  const handleSort = (pagi, filter, sorter) => {
    const order = sorter.order === "ascend" ? "asc" : "desc";
    let column;
    switch (sorter.field) {
      case "hotspot_name":
        column = "hotspot_name";
        break;
      case "alias":
        column = "alias";
        break;
      case "location":
        column = "long_city";
        break;
      case "packet_count":
        column = "packet_count";
        break;
      case "device_count":
        column = "device_count";
        break;
      case "status":
        column = "status";
        break;
      case "avg_rssi":
        column = "signal";
        break;
      default:
        column = "packet_count";
    }

    props.refetch({ column, order, page, pageSize });
    setOrder(order);
    setColumn(column);
  };

  const handleChangePage = (page) => {
    setPage(page);
    props.refetch({
      page,
      pageSize,
      column,
      order,
    });
  };

  return (
    <div>
      <div style={{ padding: 25 }}>
        <div style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 22, fontWeight: 600 }}>Device Coverage</Text>
        </div>
        <Row gutter={24}>
          <Col sm={12}>
            <div style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 15 }}>
                The hotspots listed below provided coverage for
                {props.deviceCount
                  ? ` ${props.deviceCount.count_1d} `
                  : " none "}
                of your
                <Link
                  to={"/devices"}
                  className="help-link"
                  style={{ fontSize: 15 }}
                >
                  {" "}
                  devices{" "}
                </Link>
                over the past 24 hours.
              </Text>
            </div>
            <div>
              <a
                className="help-link"
                href="https://docs.helium.com/use-the-network/console/coverage/"
                target="_blank"
              >
                Learn More about Coverage
              </a>
            </div>
          </Col>
          <Col sm={12}>
            <div
              style={{
                backgroundColor: "#F5F7F9",
                borderRadius: 10,
                padding: 16,
              }}
            >
              <div style={{ marginBottom: 4 }}>
                <img
                  draggable="false"
                  src={SelectedFlag}
                  style={{
                    height: 18,
                    marginRight: 10,
                  }}
                />
                <Text
                  style={{ fontWeight: 400, fontSize: 16, color: "#2C79EE" }}
                >
                  Claim to Follow
                </Text>
              </div>
              <div>
                <Text style={{ color: "#2C79EE" }}>
                  Claiming a Hotspot allows you to mark which Hotspots to follow
                  in your Organization, which adds it to your Organization's 'My
                  Hotspots' tab.
                </Text>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <UserCan>
        <div className="hotspot-claim">
          {selectedRows.length === 0 ||
          !selectedRows.find(
            (r) =>
              props.orgHotspotsMap[r.hotspot_address] &&
              props.orgHotspotsMap[r.hotspot_address].claimed === true
          ) ? (
            <ClaimButton
              onClick={() => {
                updateOrganizationHotspots(
                  selectedRows.map((r) => r.hotspot_address),
                  true
                );
              }}
            />
          ) : (
            <UnclaimButton
              onClick={() => {
                updateOrganizationHotspots(
                  selectedRows.map((r) => r.hotspot_address),
                  false
                );
              }}
            />
          )}
        </div>
      </UserCan>
      {props.hotspotStats && (
        <div
          style={{ overflowX: "scroll", overflowY: "hidden" }}
          className="no-scroll-bar"
        >
          <Table
            sortDirections={["descend", "ascend", "descend"]}
            showSorterTooltip={false}
            dataSource={props.hotspotStats}
            columns={columns}
            rowKey={(record) => record.hotspot_address}
            pagination={false}
            style={{ overflowY: "hidden" }}
            className="no-scroll-bar"
            onChange={handleSort}
            rowSelection={{
              onChange: (keys, selectedRows) => {
                setSelectedRows(selectedRows);
                setAllSelected(false);
              },
              onSelectAll: () => {
                setAllSelected(!allSelected);
              },
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingBottom: 0,
            }}
          >
            <Pagination
              current={page}
              pageSize={pageSize}
              total={
                props.hotspotStats && props.hotspotStats.length > 0
                  ? props.hotspotStats[0].total_entries
                  : 0
              }
              onChange={(page) => handleChangePage(page)}
              style={{ marginBottom: 20 }}
              showSizeChanger={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};
