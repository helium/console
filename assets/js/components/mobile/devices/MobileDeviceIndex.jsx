import React from "react";
import { SkeletonLayout } from "../../common/SkeletonLayout";
import { Typography } from "antd";
import MobileDeviceTableRow from "./MobileDeviceTableRow";
import MobileDeviceIndexLabelsBar from "./MobileDeviceIndexLabelsBar";
const { Text } = Typography;
import { useHistory } from "react-router-dom";

export default ({ loading, devices }) => {
  const history = useHistory();
  return (
    <div>
      <div style={{ padding: 15 }}>
        <Text style={{ fontSize: 32, fontWeight: 600 }}>My Devices</Text>
      </div>

      <MobileDeviceIndexLabelsBar push={history.push} pathname={history.location.pathname} />

      {loading && <SkeletonLayout />}
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
            {devices.entries.length} Devices
          </Text>
          {devices.entries.map(device => <MobileDeviceTableRow device={device} push={history.push} />)}
        </div>
      )}
    </div>
  );
};
