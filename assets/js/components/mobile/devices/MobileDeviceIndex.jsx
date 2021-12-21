import React from "react";
import { SkeletonLayout } from "../../common/SkeletonLayout";
import { Typography } from "antd";
import MobileDeviceTableRow from "./MobileDeviceTableRow";
import MobileDeviceIndexLabelsBar from "./MobileDeviceIndexLabelsBar";
import useElementOnScreen from "../ElementOnScreen.jsx"
import MobileAddResourceButton from "../../common/MobileAddResourceButton";
const { Text } = Typography;
import { useHistory } from "react-router-dom";

export default ({ loading, devices, refetch }) => {
  const history = useHistory();

  const [ containerRef ] = useElementOnScreen({
    root: null,
    rootMargin: "0px",
    threshold: 1.0
  }, refetch, devices)

  return (
    <div>
      <div style={{ padding: 15 }}>
        <Text style={{ fontSize: 32, fontWeight: 600 }}>My Devices</Text>
      </div>

      <MobileDeviceIndexLabelsBar
        push={history.push}
        pathname={history.location.pathname}
      />

      {loading && <SkeletonLayout />}
      {devices && (
        <div style={{ marginBottom: 15 }}>
          <Text
            style={{
              marginLeft: 15,
              marginBottom: 10,
              fontWeight: 600,
              fontSize: 16,
              display: "block",
            }}
          >
            {devices.totalEntries} Devices
          </Text>
          {devices.entries.map((device) => (
            <MobileDeviceTableRow
              key={device.id}
              device={device}
              push={history.push}
            />
          ))}
          <div style={{ height: 1 }} ref={containerRef}/>
        </div>
      )}

      <MobileAddResourceButton />
    </div>
  );
};
