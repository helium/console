import React from "react";
import { Modal, Button, Typography } from "antd";
const { Text } = Typography;

export default ({ open, close, submit, multipleDevices, newDevice }) => {
  const handleSubmit = () => {
    submit();
    close();
  };

  return (
    <Modal
      title="Do you want this label's configuration profile to apply to its devices by default?"
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
      <Text style={{ display: 'block', marginBottom: 8 }}>Some devices in this label have a different configuration profile than the label's configuration profile setting.</Text>
      <Text style={{ display: 'block', marginBottom: 8 }}><Text strong>Confirm</Text> - Devices will remove their individual configuration profiles and default to the configuration profile of this label.</Text>
      <Text style={{ display: 'block', marginBottom: 8 }}><Text strong>Cancel</Text> - Devices will retain their individual configuration profiles.</Text>
    </Modal>
  );
};
