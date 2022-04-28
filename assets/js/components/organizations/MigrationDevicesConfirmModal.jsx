import React from "react";
import { Modal, Button, Typography, Alert } from "antd";
const { Text } = Typography;

export default ({ open, handleExport, close }) => {
  return (
    <Modal
      title="Confirm Device Deactivation"
      onCancel={close}
      visible={open}
      centered
      footer={[
        <Button
          key="back"
          onClick={() => {
            handleExport(false);
          }}
        >
          Keep Active
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={() => {
            handleExport(true);
          }}
        >
          Deactivate
        </Button>,
      ]}
    >
      <Text style={{ display: "block", marginBottom: 8 }}>
        Migrations require devices to be deactivated on this Console before they
        can rejoin on the new Console.
      </Text>
      <Alert
        type="warning"
        message="Devices not deactivated may continue to connect to this Console."
        style={{ fontSize: "16px" }}
      />
      <Text style={{ display: "block", margin: "8px 0" }}>
        <Text strong>Deactivate</Text> - Choose to deactivate devices in this
        Console to prepare for migration (recommended).
      </Text>
      <Text style={{ display: "block", marginBottom: 8 }}>
        <Text strong>Keep Active</Text> - Choose if you're not ready to
        deactivate devices. <b>Important:</b> You will need to manually
        deactivate devices in this Console before devices can rejoin on the new
        Console.
      </Text>
    </Modal>
  );
};
