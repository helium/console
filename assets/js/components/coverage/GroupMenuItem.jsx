import React, { useState } from "react";
import { Button, Input } from "antd";
import { useDispatch } from "react-redux";
import { updateGroup } from "../../actions/coverage";
import CheckCircleFilled from "@ant-design/icons/CheckCircleFilled";
import DeleteFilled from "@ant-design/icons/DeleteFilled";
import EditFilled from "@ant-design/icons/EditFilled";
import SaveOutlined from "@ant-design/icons/SaveOutlined";
import CloseOutlined from "@ant-design/icons/CloseOutlined";
import Text from "antd/lib/typography/Text";

export default ({
  group,
  handleClick,
  hotspotId,
  isGroupSelected,
  activateDeleteModal,
}) => {
  const dispatch = useDispatch();
  const [editable, setEditable] = useState(false);
  const [name, setName] = useState(group.name);

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
          onClick={() => {
            handleClick(hotspotId, group.id, isGroupSelected);
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
                ...(isGroupSelected && { color: "#2C79EE" }),
                paddingLeft: 10,
                fontSize: 16,
              }}
              ellipsis
            >
              {group.name}
            </Text>
            {isGroupSelected && (
              <CheckCircleFilled style={{ marginLeft: 5, color: "#2C79EE" }} />
            )}
          </span>
          <span>
            <Button
              type="primary"
              icon={<EditFilled style={{ fontSize: 16, color: "gray" }} />}
              style={{
                background: "none",
                border: "none",
                boxShadow: "none",
              }}
              onClick={(event) => {
                event.stopPropagation();
                setEditable(true);
              }}
            />
            <Button
              type="primary"
              icon={<DeleteFilled style={{ fontSize: 16, color: "red" }} />}
              style={{
                background: "none",
                border: "none",
                boxShadow: "none",
              }}
              onClick={(event) => {
                event.stopPropagation();
                activateDeleteModal();
              }}
            />
          </span>
        </div>
      )}
    </div>
  );
};
