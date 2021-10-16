import React from "react";
import { Modal, Button, Typography } from "antd";
const { Text } = Typography;

export default ({ open, close, submit, multipleDevices }) => {
  const handleSubmit = () => {
    submit();
    close();
  };

  return (
    <Modal
      title="Confirm Profile Override"
      visible={open}
      onCancel={close}
      centered
      onOk={handleSubmit}
      footer={[
        <Button key="back" onClick={close}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Continue
        </Button>,
      ]}
    >
      <div style={{ textAlign: "center" }}>
        <Text>
          {`${
            multipleDevices ? "One or more of the devices" : "The device"
          } already has a Profile applied to it. To override the existing Profile, click Continue, or click Cancel to keep the existing one.`}
        </Text>
      </div>
    </Modal>
  );
};
