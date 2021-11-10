import React, { useState } from "react";
import { Modal, Button, Input } from "antd";
import { useDispatch } from "react-redux";
import { updateGroup } from "../../actions/coverage";
import analyticsLogger from "../../util/analyticsLogger";

export default ({ show, group, close }) => {
  const dispatch = useDispatch();
  const [name, setName] = useState(group.name);

  const handleSubmit = () => {
    dispatch(updateGroup(group.id, { name })).then(() => {
      close();
      analyticsLogger.logEvent("ACTION_UPDATE_HOTSPOT_GROUP", {
        group_id: group.id,
      });
    });
  };

  return (
    <Modal
      title="Rename Hotspot Group"
      visible={show}
      onCancel={close}
      centered
      onOk={handleSubmit}
      footer={[
        <Button key="back" onClick={close}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Submit
        </Button>,
      ]}
    >
      {group && (
        <Input
          placeholder="Enter New Group Name"
          name="groupName"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          style={{ marginTop: 10 }}
          suffix={`${name.length}/50`}
          maxLength={50}
        />
      )}
    </Modal>
  );
};
