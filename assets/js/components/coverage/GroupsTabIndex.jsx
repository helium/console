import React, { useState } from "react";
import { Typography, Row, Col, Button, Card, Popover } from "antd";
const { Text } = Typography;
import GroupIcon from "../../../img/coverage/group-icon.svg";
import GroupIndexIcon from "../../../img/coverage/group-index-icon.svg";
import CaretDown from "../../../img/caret-down.svg";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import DeleteGroupModal from "./DeleteGroupModal";
import GroupIndexActionsMenu from "./GroupIndexActionsMenu";

export default ({ selectGroupId, data }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);

  const groups = data ? data.allGroups : [];

  return (
    <>
      <div style={{ padding: 25, paddingTop: 8 }}>
        <Row gutter={24}>
          <Col sm={12}>
            <img
              draggable="false"
              src={GroupIcon}
              style={{
                height: 32,
                width: 32,
                marginBottom: 6,
              }}
            />
            <div style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 22, fontWeight: 600 }}>
                My Hotspot Groups
              </Text>
            </div>
            <Text style={{ fontSize: 15 }}>
              Hotspots that have been grouped appear in the area below.
            </Text>
          </Col>
          <Col sm={12}>
            <Button
              icon={<PlusOutlined />}
              type="primary"
              style={{
                borderColor: "#2C79EE",
                backgroundColor: "#2C79EE",
                borderRadius: 50,
                text: "white",
                float: "right",
              }}
              onClick={() => {
                selectGroupId("new");
              }}
            >
              Create Hotspot Group
            </Button>
          </Col>
        </Row>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            marginTop: 35,
          }}
        >
          {groups.map((g, index) => (
            <Card
              key={`group-${g.id}`}
              onClick={() => {
                selectGroupId(g.id);
              }}
              size="small"
              style={{
                minWidth: "200px",
                cursor: "pointer",
                marginRight: "18px",
                backgroundColor: "#F5F7F9",
                border: "none",
                padding: 5,
              }}
            >
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    border: "none",
                  }}
                >
                  <span>
                    <img
                      draggable="false"
                      src={GroupIndexIcon}
                      style={{
                        height: 20,
                        width: 20,
                        marginBottom: 6,
                        marginRight: 5,
                      }}
                    />
                    <Text style={{ fontWeight: 500, color: "#2C79EE" }}>
                      {g.name}
                    </Text>
                  </span>
                  <span>
                    <Popover
                      placement="bottomRight"
                      content={
                        <GroupIndexActionsMenu
                          showDeleteModal={() => {
                            setShowDeleteModal(true);
                            setGroupToDelete(g);
                          }}
                          group={g}
                        />
                      }
                      overlayClassName="hotspot-group-menu"
                    >
                      <img
                        src={CaretDown}
                        style={{ marginLeft: 5, padding: 5 }}
                      />
                    </Popover>
                  </span>
                </div>
                <>
                  <Text
                    style={{
                      fontSize: "30px",
                      position: "relative",
                      bottom: "-12px",
                    }}
                  >
                    {g.hotspots.length
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </Text>
                  <Text
                    style={{
                      fontSize: "18px",
                      color: "#A6B8CB",
                      fontWeight: 400,
                      display: "block",
                    }}
                  >
                    Hotspot
                    {`${
                      g.hotspots.length > 1 || g.hotspots.length === 0
                        ? "s"
                        : ""
                    }`}
                  </Text>
                </>
              </>
            </Card>
          ))}
        </div>
      </div>
      <DeleteGroupModal
        show={showDeleteModal}
        group={groupToDelete}
        close={() => {
          setShowDeleteModal(false);
        }}
      />
    </>
  );
};
