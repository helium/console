import React from "react";
import MobileTableRow from "../../common/MobileTableRow";
import { Typography } from "antd";
import MenuCaret from "../../../../img/channels/mobile/menu-caret.svg";
import FUp from "../../../../img/devices/device-row-f-up.svg";
import FDown from "../../../../img/devices/device-row-f-down.svg";
const { Text } = Typography;

export default ({ device, push }) => (
  <MobileTableRow
    id={device.id}
    key={device.id}
    mainTitle={device.name}
    subtext={device.dev_eui}
    onClick={() => {
      push(`/devices/${device.id}`);
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
)
