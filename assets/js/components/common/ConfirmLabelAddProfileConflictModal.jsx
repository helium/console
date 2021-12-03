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
      title={`Do you want this label's configuration profile to apply to ${multipleDevices ? "its devices" : "this device"} by default?`}
      visible={open}
      onCancel={close}
      centered
      onOk={handleSubmit}
      footer={[
        <Button key="back" onClick={close}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Confirm
        </Button>,
      ]}
    >
      <Text style={{ display: 'block', marginBottom: 8 }}>{multipleDevices ? "Some devices" : "This device"} in this label ha{multipleDevices ? "ve" : "s"} a different configuration profile than the label's configuration profile setting.</Text>
      <Text style={{ display: 'block', marginBottom: 8 }}><Text strong>Confirm</Text> - {multipleDevices ? "Devices" : "This device"} will remove individual configuration profiles and default to the configuration profile of this label.</Text>
      <Text style={{ display: 'block', marginBottom: 8 }}><Text strong>Cancel</Text> - {multipleDevices ? "Devices" : "This device"} will retain individual configuration profiles.</Text>
    </Modal>
  );
};
