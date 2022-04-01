import React, { useEffect, useState } from "react";
import { Typography, Row, Col, Table, Pagination } from "antd";
const { Text } = Typography;
import {
  followHotspot,
  preferHotspot,
  followHotspots,
} from "../../actions/coverage";
import { getColumns } from "./Constants";
import HeaderFlag from "../../../img/coverage/followed-tab-header-flag.svg";
import ConfirmHotspotUnfollowModal from "./ConfirmHotspotUnfollowModal";

export default (props) => {
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const [column, setColumn] = useState("packet_count");
  const [order, setOrder] = useState("desc");
  const [showConfirmUnfollowModal, setShowConfirmUnfollowModal] =
    useState(false);
  const [hotspotsToUnfollow, setHotspotsToUnfollow] = useState([]);

  const warnUnfollow = (hotspotsToUnfollow) => {
    setShowConfirmUnfollowModal(true);
    setHotspotsToUnfollow(hotspotsToUnfollow);
  };

  const columns = getColumns(
    props,
    followHotspot,
    preferHotspot,
    props.selectHotspotAddress,
    props.tab,
    warnUnfollow
  );

  const handleSort = (pagi, filter, sorter) => {
    const order = sorter.order === "ascend" ? "asc" : "desc";
    let column;
    switch (sorter.field) {
      case "hotspot_name":
        column = "hotspot_name";
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
    <>
      <>
        <div style={{ padding: 25, paddingTop: 8 }}>
          <img
            draggable="false"
            src={HeaderFlag}
            style={{
              height: 32,
              width: 50,
              marginBottom: 6,
            }}
          />
          <div style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 22, fontWeight: 600 }}>My Hotspots</Text>
          </div>
          <Row gutter={24}>
            <Col sm={12}>
              <Text style={{ fontSize: 15 }}>
                Hotspots that have been 'followed' or 'preferred' appear in the
                list below.
              </Text>
            </Col>
          </Row>
        </div>

        {props.hotspotStats && (
          <div
            style={{ overflowX: "scroll", overflowY: "hidden" }}
            className="no-scroll-bar"
          >
            <Table
              showSorterTooltip={false}
              sortDirections={["descend", "ascend", "descend"]}
              dataSource={props.hotspotStats.filter(
                (hs) =>
                  props.orgHotspotsMap[hs.hotspot_address] &&
                  props.orgHotspotsMap[hs.hotspot_address].claimed
              )}
              columns={columns}
              rowKey={(record) => {
                return record.hotspot_address;
              }}
              pagination={false}
              style={{ overflowY: "hidden" }}
              className="no-scroll-bar"
              onChange={handleSort}
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
      </>
      <ConfirmHotspotUnfollowModal
        open={showConfirmUnfollowModal}
        close={() => {
          setShowConfirmUnfollowModal(false);
        }}
        submit={() => {
          followHotspots(hotspotsToUnfollow, false).then(() => {
            setShowConfirmUnfollowModal(false);
          });
        }}
        multiple={hotspotsToUnfollow.length > 1}
      />
    </>
  );
};
