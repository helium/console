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
      title="Confirm Label Attachment"
      visible={open}
      onCancel={close}
      centered
      onOk={handleSubmit}
      footer={[
        <Button key="back" onClick={close}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Add Label
        </Button>,
      ]}
    >
      <div style={{ textAlign: "center" }}>
        <Text>
          {`The label you are trying to add has a different profile than ${
            multipleDevices ? "one or more of the devices" : "the device"
          }. Label profiles override device profiles.`}
          <br />
          <br />
          {`Are you sure you want to add this label to ${
            multipleDevices ? "these devices" : "the device"
          }?`}
        </Text>
      </div>
    </Modal>
  );
};
