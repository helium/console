import React from "react";
import { Typography } from "antd";
import MobileDeviceTableRow from "../devices/MobileDeviceTableRow";
import MobileDeviceIndexLabelsBar from "../devices/MobileDeviceIndexLabelsBar";
const { Text } = Typography;
import { useHistory } from "react-router-dom";

export default ({ label }) => {
  const history = useHistory();
  const devices = label.devices

  return (
    <div>
      <div style={{ padding: 15 }}>
        <Text style={{ fontSize: 32, fontWeight: 600 }}>{label.name}</Text>
      </div>

      <MobileDeviceIndexLabelsBar push={history.push} pathname={history.location.pathname} />
      {devices && (
        <div>
          <Text
            style={{
              marginLeft: 15,
              marginBottom: 10,
              fontWeight: 600,
              fontSize: 16,
              display: "block",
            }}
          >
            {devices.length} Devices
          </Text>
          {devices.map(device => <MobileDeviceTableRow device={device} push={history.push} />)}
        </div>
      )}
    </div>
  );
};
