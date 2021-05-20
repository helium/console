import React from "react";
import { Modal, Button, Typography } from "antd";
const { Text } = Typography;
import { useDispatch } from "react-redux";
import { deleteAlert } from "../../actions/alert";
import analyticsLogger from "../../util/analyticsLogger";

export default ({ open, alert, close }) => {
  const dispatch = useDispatch();

  const handleSubmit = () => {
    analyticsLogger.logEvent("ACTION_DELETE_ALERT", {
      id: alert.id,
    });
    dispatch(deleteAlert(alert.id)).then((_) => {
      close();
    });
  };

  return (
    <Modal
      title="Delete Alert"
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
      {alert && (
        <div style={{ textAlign: "center" }}>
          <Text>
            Are you sure you want to delete the alert, <b>{alert.name}</b>?
          </Text>
        </div>
      )}
    </Modal>
  );
};
