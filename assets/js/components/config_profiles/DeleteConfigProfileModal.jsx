import React from "react";
import { Modal, Button, Typography } from "antd";
const { Text } = Typography;
import { useDispatch } from "react-redux";
import { deleteConfigProfile } from "../../actions/configProfile";
import { useHistory } from "react-router-dom";

export default ({ open, selected, close }) => {
  const dispatch = useDispatch();
  const history = useHistory();

  const handleSubmit = () => {
    dispatch(deleteConfigProfile(selected.id)).then(() => {
      close();
      history.push("/config_profiles");
    });
  };

  return (
    <Modal
      title="Delete Profile"
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
            Are you sure you want to delete the profile, <b>{selected.name}</b>?
          </Text>
        </div>
      )}
    </Modal>
  );
};
