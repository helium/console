import React from "react";
import { Modal, Button, Typography } from "antd";
const { Text } = Typography;
import { useDispatch } from "react-redux";
import { deleteGroup } from "../../actions/coverage";
import analyticsLogger from "../../util/analyticsLogger";

export default ({ show, group, close, back }) => {
  const dispatch = useDispatch();

  const handleSubmit = () => {
    dispatch(deleteGroup(group.id)).then(() => {
      close();
      if (back) back();
      analyticsLogger.logEvent("ACTION_DELETE_HOTSPOT_GROUP", {
        group_id: group.id,
      });
    });
  };

  return (
    <Modal
      title="Delete Group"
      visible={show}
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
      {group && (
        <div style={{ textAlign: "center" }}>
          {group.hotspots.length + group.hotspots.length > 5 && (
            <Text>{group.name} is currently has more than 5.</Text>
          )}
          {group.hotspots.length > 0 && group.hotspots.length < 4 && (
            <Text>
              {group.name} currently has: <br />
              <ul style={{ textAlign: "center", listStylePosition: "inside" }}>
                {group.hotspots.map((h) => (
                  <li key={h.id} style={{ margin: 0 }}>
                    Hotspot <b>{h.hotspot_name}</b>
                  </li>
                ))}
              </ul>
            </Text>
          )}
          <Text>Are you sure you want to delete this Group?</Text>
        </div>
      )}
    </Modal>
  );
};
