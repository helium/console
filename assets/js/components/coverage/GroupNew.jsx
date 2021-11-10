import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Card, Button, Input } from "antd";
import UserCan from "../common/UserCan";
import { createGroup } from "../../actions/coverage";
import SaveOutlined from "@ant-design/icons/SaveOutlined";
import analyticsLogger from "../../util/analyticsLogger";

export default ({ back }) => {
  const dispatch = useDispatch();
  const [name, setName] = useState("");

  const handleSubmit = () => {
    dispatch(createGroup({ name })).then((res) => {
      back();
      analyticsLogger.logEvent("ACTION_CREATE_HOTSPOT_GROUP", {
        group_id: res.data.id,
      });
    });
  };

  return (
    <div style={{ padding: "30px 30px 20px 30px", minWidth: 700 }}>
      <Card title="Enter Group Details">
        <Input
          placeholder="Enter Group Name"
          name="groupName"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          style={{ marginTop: 10 }}
          suffix={`${name.length}/25`}
          maxLength={25}
        />
      </Card>
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-end",
        }}
      >
        <UserCan>
          <Button
            style={{ marginRight: 5 }}
            onClick={() => {
              back();
            }}
          >
            Cancel
          </Button>
          <Button
            key="submit"
            icon={<SaveOutlined />}
            onClick={handleSubmit}
            style={{ margin: 0 }}
            type="primary"
          >
            Save Group
          </Button>
        </UserCan>
      </div>
    </div>
  );
};
