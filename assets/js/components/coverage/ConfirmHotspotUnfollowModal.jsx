import React from "react";
import { Modal, Button, Typography } from "antd";
const { Text } = Typography;

export default ({ open, close, submit, multiple }) => {
  return (
    <Modal
      title={`Are you sure you want to Unfollow ${
        multiple ? "these" : "this"
      } Preferred Hotspot${multiple ? "s" : ""}?`}
      visible={open}
      onCancel={close}
      centered
      onOk={submit}
      footer={[
        <Button key="back" onClick={close}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={submit}>
          Continue
        </Button>,
      ]}
    >
      <div style={{ textAlign: "center" }}>
        <Text>
          If you continue, the Preferred Hotspot setting will be turned off in
          all existing Packet Configurations, since there must be at least one
          Preferred Hotspot for this feature to be enabled.
        </Text>
      </div>
    </Modal>
  );
};
