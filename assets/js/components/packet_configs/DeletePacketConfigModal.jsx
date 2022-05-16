import React from "react";
import { Modal, Button, Typography } from "antd";
const { Text } = Typography;
import { useDispatch } from "react-redux";
import { deletePacketConfig } from "../../actions/packetConfig";
import { useHistory } from "react-router-dom";

export default ({ open, selected, close }) => {
  const dispatch = useDispatch();
  const history = useHistory();

  const handleSubmit = () => {
    dispatch(deletePacketConfig(selected.id)).then(() => {
      close();
      history.push("/packets");
    });
  };

  return (
    <Modal
      title="Delete Packet Config"
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
      {selected && (
        <div style={{ textAlign: "center" }}>
          <Text>
            Are you sure you want to delete the config, <b>{selected.name}</b>?
          </Text>
        </div>
      )}
    </Modal>
  );
};
