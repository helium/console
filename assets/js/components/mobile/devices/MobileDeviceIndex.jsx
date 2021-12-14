import React from "react";
import { SkeletonLayout } from "../../common/SkeletonLayout";
import { Typography } from "antd";
import MobileTableRow from "../../common/MobileTableRow";
import MobileDeviceIndexLabelsBar from "./MobileDeviceIndexLabelsBar";
import MenuCaret from "../../../../img/channels/mobile/menu-caret.svg";
import FUp from "../../../../img/devices/device-row-f-up.svg";
import FDown from "../../../../img/devices/device-row-f-down.svg";
const { Text } = Typography;
import { useHistory } from "react-router-dom";

export default ({ loading, devices }) => {
  const history = useHistory();
  return (
    <div>
      <div style={{ padding: 15 }}>
        <Text style={{ fontSize: 32, fontWeight: 600 }}>My Devices</Text>
      </div>

      <MobileDeviceIndexLabelsBar history={history} />

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
          {devices.entries.map((device) => (
            <MobileTableRow
              id={device.id}
              key={device.id}
              mainTitle={device.name}
              subtext={device.dev_eui}
              onClick={() => {
                history.push(`/devices/${device.id}`);
              }}
              rightAction={
                <span>
                  <Text style={{ fontSize: 16 }} strong>
                    {device.frame_up || 0}
                    <img src={FUp} style={{ height: 13, marginLeft: 2, position: 'relative', top: -2 }} />
                  </Text>
                  <Text style={{ fontSize: 16, marginLeft: 12 }} strong>
                    {device.frame_down || 0}
                    <img src={FDown} style={{ height: 13, marginLeft: 2, position: 'relative', top: -2 }} />
                  </Text>
                  <img src={MenuCaret} style={{ marginLeft: 25, height: 12 }} />
                </span>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};
