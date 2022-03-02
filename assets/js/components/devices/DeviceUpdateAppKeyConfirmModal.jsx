import React from "react";
import { Modal, Button, Typography } from "antd";
const { Text } = Typography;

export default ({ open, close, handleSubmit }) => {
  return (
    <Modal
      title="Confirm App Key Update"
      visible={open}
      onCancel={close}
      centered
      onOk={handleSubmit}
      footer={[
        <Button key="back" onClick={close}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          OK
        </Button>,
      ]}
    >
      <div style={{ textAlign: "center" }}>
        <Text>
          Make sure the device contains the updated app key and rejoin the
          device to ensure changes take effect.
        </Text>
      </div>
    </Modal>
  );
};
