import React, { useState } from "react";
import { Button, Input } from "antd";
import { useDispatch } from "react-redux";
import { createGroup } from "../../actions/coverage";
import SaveOutlined from "@ant-design/icons/SaveOutlined";
import CloseOutlined from "@ant-design/icons/CloseOutlined";
import Text from "antd/lib/typography/Text";
import analyticsLogger from "../../util/analyticsLogger";

export default () => {
  const dispatch = useDispatch();
  const [editable, setEditable] = useState(false);
  const [name, setName] = useState("");

  return (
    <div style={{ display: "block" }} className="hotspot-group-option">
      {editable ? (
        <div
          style={{
            display: "flex",
            width: 250,
            justifyContent: "space-between",
            border: "none",
          }}
        >
          <span style={{ maxWidth: "70%" }}>
            <Input
              placeholder="New Group Name"
              style={{ marginLeft: 5 }}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
              maxLength={25}
            />
          </span>
          <span>
            <Button
              type="primary"
              icon={<SaveOutlined style={{ fontSize: 16, color: "white" }} />}
              onClick={() => {
                dispatch(createGroup({ name })).then((res) => {
                  setEditable(false);
                  analyticsLogger.logEvent(
                    "ACTION_CREATE_HOTSPOT_GROUP_VIA_MENU",
                    {
                      group_id: res.data.id,
                    }
                  );
                });
              }}
            />
            <Button
              type="primary"
              icon={<CloseOutlined style={{ fontSize: 16, color: "gray" }} />}
              style={{
                background: "none",
                border: "none",
                boxShadow: "none",
              }}
              onClick={() => {
                setEditable(false);
              }}
            />
          </span>
        </div>
      ) : (
        <div
          onClick={() => {
            setEditable(true);
          }}
          style={{
            display: "flex",
            width: 250,
            justifyContent: "space-between",
            border: "none",
          }}
        >
          <span
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              maxWidth: "65%",
            }}
          >
            <Text
              style={{
                color: "#ADBECF",
                paddingLeft: 10,
                fontSize: 16,
                lineHeight: "30px",
              }}
            >
              + Create New...
            </Text>
          </span>
        </div>
      )}
    </div>
  );
};
