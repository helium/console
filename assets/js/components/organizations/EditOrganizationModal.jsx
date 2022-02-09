import React, { useState } from "react";
import { Button, Input, Modal, Typography, Tooltip } from "antd";
const { Text } = Typography;
import analyticsLogger from "../../util/analyticsLogger";
import { renameOrganization } from "../../actions/organization";
import { useDispatch } from "react-redux";

export default ({ open, selectedOrg, onClose }) => {
  const dispatch = useDispatch();
  const [orgName, setOrgName] = useState("");
  const handleSubmit = () => {
    dispatch(renameOrganization(selectedOrg.id, { name: orgName }));
    onClose();
  };
  const handleInputUpdate = (e) => {
    analyticsLogger.logEvent("ACTION_RENAME_ORGANIZATION", {
      id: selectedOrg.id,
      name: orgName,
    });
    setOrgName(e.target.value);
  };
  return (
    <Modal
      title="Edit Organization"
      visible={open}
      onCancel={onClose}
      centered
      bodyStyle={{ padding: 0 }}
      footer={[
        <Button key="back" onClick={onClose}>
          Discard Changes
        </Button>,
        <Tooltip title="Organization name must be at least 3 characters">
          <Button
            style={{ marginLeft: 5 }}
            type="primary"
            key="submit"
            onClick={handleSubmit}
            disabled={orgName === "" || orgName.length < 3}
          >
            Apply Changes
          </Button>
        </Tooltip>,
      ]}
    >
      <div style={{ padding: "30px 50px" }}>
        <Text strong style={{ fontSize: 16 }}>
          Organization Name
        </Text>
        <Input
          placeholder={selectedOrg && selectedOrg.name}
          name="labelName"
          value={orgName}
          onChange={handleInputUpdate}
          style={{ marginBottom: 20, marginTop: 4 }}
          suffix={`${orgName ? orgName.length : "0"}/50`}
          maxLength={50}
        />
      </div>
    </Modal>
  );
};
