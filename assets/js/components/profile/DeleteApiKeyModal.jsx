import React from "react";
import { Modal, Button, Typography } from "antd";
const { Text } = Typography;
import { useDispatch } from "react-redux";
import analyticsLogger from "../../util/analyticsLogger";
import { deleteKey } from "../../actions/apiKeys";

export default ({ open, apiKey, close }) => {
  const dispatch = useDispatch();

  const handleSubmit = () => {
    analyticsLogger.logEvent("ACTION_DELETE_API_apiKey", {
      id: apiKey.id,
    });
    dispatch(deleteKey(apiKey.id)).then((_) => {
      close();
    });
  };

  return (
    <Modal
      title="Delete API Key"
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
      {apiKey && (
        <div style={{ textAlign: "center" }}>
          <Text>
            Are you sure you want to delete the API apiKey, <b>{apiKey.name}</b>
            ?
          </Text>
        </div>
      )}
    </Modal>
  );
};
