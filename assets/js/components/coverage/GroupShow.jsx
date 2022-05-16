import React, { useState, useEffect } from "react";
import { Button, Col, Row, Typography, Table, Pagination } from "antd";
const { Text } = Typography;
import ArrowLeftOutlined from "@ant-design/icons/ArrowLeftOutlined";
import EditFilled from "@ant-design/icons/EditFilled";
import DeleteFilled from "@ant-design/icons/DeleteFilled";
import { followHotspot, preferHotspot } from "../../actions/coverage";
import { getColumns } from "./Constants";
import DeleteGroupModal from "./DeleteGroupModal";
import EditGroupModal from "./EditGroupModal";
import UserCan from "../common/UserCan";

export default (props) => {
  const { back, groupSelected, data, getGroupedHotspotStats } = props;
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 25;
  const [column, setColumn] = useState("packet_count");
  const [order, setOrder] = useState("desc");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (groupSelected) {
      getGroupedHotspotStats({
        variables: {
          page,
          pageSize: PAGE_SIZE,
          column,
          order,
          groupId: groupSelected.id,
        },
      });
    }
  }, [groupSelected]);

  const columns = getColumns(
    props,
    followHotspot,
    preferHotspot,
    props.selectHotspotAddress,
    props.tab
  );

  const handleSortChange = (column, order) => {
    setColumn(column);
    setOrder(order);
    getGroupedHotspotStats({
      variables: { page, pageSize: PAGE_SIZE, column, order, groupId },
    });
  };

  const handleChangePage = (page) => {
    setPage(page);
    getGroupedHotspotStats({
      variables: { page, pageSize: PAGE_SIZE, column, order, groupId },
    });
  };

  return (
    <>
      <div style={{ padding: 20 }}>
        <Row gutter={24}>
          <Col sm={12}>
            <Button
              icon={<ArrowLeftOutlined style={{ fontSize: 12 }} />}
              style={{
                border: "none",
                padding: 0,
                fontSize: 14,
                color: "#2C79EE",
                height: 24,
              }}
              onClick={() => {
                back();
              }}
            >
              Back to Hotspot Groups
            </Button>
          </Col>
          <Col sm={12}>
            <UserCan>
              {" "}
              <Button
                style={{
                  float: "right",
                  border: "none",
                  padding: 0,
                  fontSize: 14,
                  color: "#2C79EE",
                  height: 24,
                }}
                onClick={() => {
                  setShowEditModal(true);
                }}
              >
                Rename Hotspot Group <EditFilled />
              </Button>
            </UserCan>
          </Col>
        </Row>
        <Row>
          <UserCan>
            <Button
              style={{
                border: "none",
                padding: 0,
                fontSize: 14,
                color: "red",
                height: 24,
                marginLeft: "auto",
                marginRight: 0,
              }}
              onClick={() => {
                setShowDeleteModal(true);
              }}
            >
              Delete Hotspot Group <DeleteFilled />
            </Button>
          </UserCan>
        </Row>
        <Row>
          <Text style={{ fontSize: 22, fontWeight: 600, marginRight: 10 }}>
            {groupSelected.name}
          </Text>
          <Text style={{ color: "#2C79EE", lineHeight: "40px" }}>
            {data ? data.groupedHotspotStats.length : 0} Hotspots
          </Text>
        </Row>
        <Row>
          <Text style={{ fontSize: 15, width: "40%" }}>
            Hotspots that have been added to your Hotspot Group '
            {groupSelected.name}' are shown below:
          </Text>
        </Row>
      </div>
      <div
        style={{ overflowX: "scroll", overflowY: "hidden" }}
        className="no-scroll-bar"
      >
        <Table
          sortDirections={["descend", "ascend", "descend"]}
          showSorterTooltip={false}
          dataSource={data ? data.groupedHotspotStats : []}
          columns={columns}
          rowKey={(record) => record.hotspot_address}
          pagination={false}
          style={{ overflowY: "hidden" }}
          className="no-scroll-bar"
          onChange={handleSortChange}
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
            PAGE_SIZE={PAGE_SIZE}
            total={
              data && data.groupedHotspotStats.length > 0
                ? data.groupedHotspotStats[0].total_entries
                : 0
            }
            onChange={(page) => handleChangePage(page)}
            style={{ marginBottom: 20 }}
            showSizeChanger={false}
          />
        </div>
      </div>
      <DeleteGroupModal
        show={showDeleteModal}
        group={groupSelected}
        close={() => {
          setShowDeleteModal(false);
        }}
        back={back}
      />
      <EditGroupModal
        show={showEditModal}
        group={groupSelected}
        close={() => {
          setShowEditModal(false);
        }}
      />
    </>
  );
};
