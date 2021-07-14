import React from "react";
import { Modal, Button, Typography } from "antd";
const { Text } = Typography;
import { useDispatch } from "react-redux";
import { deleteMultiBuy } from "../../actions/multiBuy";
import { useHistory } from "react-router-dom";

export default ({ open, selected, close }) => {
  const dispatch = useDispatch();
  const history = useHistory();

  const handleSubmit = () => {
    dispatch(deleteMultiBuy(selected.id)).then(() => {
      close();
      history.push("/multi_buys");
    });
  };

  return (
    <Modal
      title="Delete Multiple Packet"
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
