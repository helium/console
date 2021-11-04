import React from "react";
import { Typography, Row, Col, Button, Card } from "antd";
const { Text } = Typography;
import GroupIcon from "../../../img/coverage/group-icon.svg";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import { ALL_GROUPS } from "../../graphql/coverage";
import { useQuery } from "@apollo/client";

export default () => {
  const { loading, error, data, refetch } = useQuery(ALL_GROUPS, {
    fetchPolicy: "cache-first",
  });

  const groups = data ? data.allGroups : [];

  return (
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
              console.log("here");
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
            size="small"
            style={
              index !== 0 && (index + 1) % 4 === 0
                ? {}
                : { marginRight: "10px" }
            }
          >
            {g.name}
          </Card>
        ))}
      </div>
    </div>
  );
};
