import React from "react";
import { Modal, Button, Typography } from "antd";
const { Text } = Typography;

export default ({ open, type, deleteNode, onClose }) => {
  return (
    <Modal
      title={"Remove Node from Workspace"}
      visible={open}
      onCancel={onClose}
      centered
      onOk={() => {
        deleteNode();
        onClose();
      }}
      footer={[
        <Button key="back" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={() => {
            deleteNode();
            onClose();
          }}
        >
          Submit
        </Button>,
      ]}
    >
      <div style={{ marginBottom: 20 }}>
        <Text>
          Are you sure you want to remove this{" "}
          {type === "channel" ? "integration" : type} node from the workspace? Edges connected to this node will be removed as well.
        </Text>
      </div>
    </Modal>
  );
};
