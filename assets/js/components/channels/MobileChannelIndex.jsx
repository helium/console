import React from "react";
import { SkeletonLayout } from "../common/SkeletonLayout";
import { Typography } from "antd";
import MobileTableRow from "../common/MobileTableRow";
const { Text } = Typography;
import MenuCaret from "../../../img/channels/mobile/menu-caret.svg";
import MobileAddResourceButton from "../common/MobileAddResourceButton";
import { useHistory } from "react-router-dom";

export default ({ loading, channels }) => {
  const history = useHistory();
  return (
    <div>
      <div style={{ padding: 15 }}>
        <Text style={{ fontSize: 32, fontWeight: 600 }}>Integrations</Text>
      </div>
      {loading && <SkeletonLayout />}
      {channels && (
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
            {channels.entries.length} Integrations
          </Text>
          {channels.entries.map((channel) => (
            <MobileTableRow
              id={channel.id}
              key={channel.id}
              mainTitle={channel.name}
              subtext={channel.type_name}
              onClick={() => {
                history.push(`/integrations/${channel.id}`);
              }}
              rightAction={
                <span>
                  <Text style={{ fontSize: 16 }} strong>
                    {channel.number_devices} Device
                    {channel.number_devices === 0 || channel.number_devices > 1
                      ? "s"
                      : ""}
                  </Text>
                  <img src={MenuCaret} style={{ marginLeft: 25, height: 12 }} />
                </span>
              }
            />
          ))}
        </div>
      )}

      <MobileAddResourceButton />
    </div>
  );
};
