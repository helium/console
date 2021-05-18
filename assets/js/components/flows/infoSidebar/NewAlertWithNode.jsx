import React from "react";
import { PlusOutlined } from "@ant-design/icons";
import Text from "antd/lib/typography/Text";
import { useDispatch } from "react-redux";
import { createAlert, addAlertToNode } from "../../../actions/alert";
import AlertSettings from "../../alerts/AlertSettings";

export default (props) => {
  const dispatch = useDispatch();
  const alertType = ["device", "label"].includes(props.nodeType)
    ? "device/label"
    : props.nodeType;

  return (
    <div style={{ padding: "0px 40px 0px 40px" }}>
      <Text
        style={{ display: "block", fontSize: "20px", marginBottom: 5 }}
        strong
      >
        Create New Alert
      </Text>
      <AlertSettings
        alertType={alertType}
        save={(name, config) => {
          dispatch(
            createAlert({
              name: name,
              config,
              node_type: alertType,
            })
          ).then((data) => {
            dispatch(
              addAlertToNode(data.data.id, props.nodeId, props.nodeType)
            );
            props.back();
          });
        }}
        saveText="Create"
        back={props.back}
        saveIcon={<PlusOutlined />}
        cancel
      />
    </div>
  );
};
