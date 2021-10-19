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
          {selected.devices.length + selected.labels.length > 5 && (
            <Text>
              {selected.name} is currently applied to more than 5 devices or
              labels.{" "}
            </Text>
          )}
          {selected.devices.length + selected.labels.length > 0 &&
            selected.devices.length + selected.labels.length < 4 && (
              <Text>
                {selected.name} is currently applied to: <br />
                <ul
                  style={{ textAlign: "center", listStylePosition: "inside" }}
                >
                  {selected.devices.map((d) => (
                    <li key={d.id} style={{ margin: 0 }}>
                      Device <b>{d.name}</b>
                    </li>
                  ))}
                  {selected.labels.map((l) => (
                    <li key={l.id} style={{ margin: 0 }}>
                      Label <b>{l.name}</b>
                    </li>
                  ))}
                </ul>
              </Text>
            )}
          <Text>Are you sure you want to delete this Profile?</Text>
        </div>
      )}
    </Modal>
  );
};
