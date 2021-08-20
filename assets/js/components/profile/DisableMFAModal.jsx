import React from "react";
import { Modal, Button, Typography } from "antd";
const { Text } = Typography;

export default ({ open, handleSubmit, close }) => {
  return (
    <Modal
      title="Disable Two-Factor"
      visible={open}
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
      <div style={{ textAlign: "center" }}>
        <Text>
          Are you sure you want to remove your existing Two-Factor authentication method?
        </Text>
      </div>
    </Modal>
  );
};
