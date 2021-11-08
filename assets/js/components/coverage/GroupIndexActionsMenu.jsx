import React, { useState } from "react";
import DeleteGroupIcon from "../../../img/coverage/delete-group-icon.svg";
import EditGroupIcon from "../../../img/coverage/edit-group-icon.svg";
import SaveOutlined from "@ant-design/icons/SaveOutlined";
import CloseOutlined from "@ant-design/icons/CloseOutlined";
import { Input, Typography, Button } from "antd";
const { Text } = Typography;
import { useDispatch } from "react-redux";
import { updateGroup } from "../../actions/coverage";
import analyticsLogger from "../../util/analyticsLogger";

export default ({ showDeleteModal, group }) => {
  const dispatch = useDispatch();
  const [editable, setEditable] = useState(false);
  const [name, setName] = useState(group.name);

  return (
    <div
      style={{ padding: "2px 0" }}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {editable ? (
        <div
          style={{
            display: "flex",
            width: 180,
            justifyContent: "space-between",
            border: "none",
          }}
        >
          <span style={{ maxWidth: "60%" }}>
            <Input
              style={{ marginLeft: 5 }}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
          </span>
          <span>
            <Button
              type="primary"
              icon={<SaveOutlined style={{ fontSize: 16, color: "white" }} />}
              onClick={() => {
                dispatch(updateGroup(group.id, { name })).then(() => {
                  setEditable(false);
                  analyticsLogger.logEvent(
                    "ACTION_UPDATE_HOTSPOT_GROUP_VIA_MENU",
                    {
                      group_id: group.id,
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
                setName(group.name);
                setEditable(false);
              }}
            />
          </span>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            width: 180,
            justifyContent: "space-between",
            border: "none",
          }}
          className="group-actions"
          onClick={() => {
            setEditable(true);
          }}
        >
          <Text style={{ paddingLeft: 10, fontSize: 16 }}>Rename</Text>
          <span
            style={{
              display: "inline-flex",
              justifyContent: "center",
              alignItems: "center",
              paddingRight: 10,
            }}
          >
            <img
              src={EditGroupIcon}
              style={{
                height: 14,
              }}
            />
          </span>
        </div>
      )}
      <div
        style={{
          display: "flex",
          width: 180,
          justifyContent: "space-between",
          border: "none",
        }}
        className="group-actions"
        onClick={() => {
          showDeleteModal();
        }}
      >
        <Text style={{ paddingLeft: 10, fontSize: 16 }}>Delete</Text>
        <span
          style={{
            display: "inline-flex",
            justifyContent: "center",
            alignItems: "center",
            paddingRight: 10,
          }}
        >
          <img
            src={DeleteGroupIcon}
            style={{
              height: 14,
            }}
          />
        </span>
      </div>
    </div>
  );
};
