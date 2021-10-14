import React from "react";
import { Popover } from "antd";
import WeakSignalIcon from "../../../img/coverage/signal/weak-icon.svg";
import MediumSignalIcon from "../../../img/coverage/signal/medium-icon.svg";
import StrongSignalIcon from "../../../img/coverage/signal/strong-icon.svg";
import UnknownSignalIcon from "../../../img/coverage/signal/unknown-icon.svg";

export default ({ rssi }) => {
  let icon;
  let strength;

  if (rssi <= -30.0 && rssi >= -50.0) {
    icon = StrongSignalIcon;
    strength = "Strong";
  } else if (rssi <= 50.01 && rssi >= -99.99) {
    icon = MediumSignalIcon;
    strength = "Medium";
  } else if (rssi <= -100 && rssi >= -120) {
    icon = WeakSignalIcon;
    strength = "Weak";
  } else {
    icon = UnknownSignalIcon;
    strength = "Unknown";
  }

  const content = (
    <>
      <b>{strength} Signal</b>
      {rssi && <div>Avg {rssi}dBm</div>}
    </>
  );

  return (
    <Popover content={content} placement="right" overlayStyle={{ width: 170 }}>
      <img src={icon} style={{ height: 16 }} />
    </Popover>
  );
};
