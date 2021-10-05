import React, { Fragment } from "react";
import { Handle } from "react-flow-renderer";
import { Typography, Tooltip } from "antd";
const { Text } = Typography;
import DeviceIcon from "../../../../img/device-node-icon.svg";
import ProfileTag from "../../../../img/config_profile/profile_small_white.svg";
import MultiBuyTag from "../../../../img/multi_buy/multi-buy-node-tag.svg";
import SelectedNodeIcon from "./SelectedNodeIcon";
import AlertTag from "../../../../img/alerts/alert-node-tag.svg";
import inXORFilterDeviceTag from "../../../../img/in_xor_filter/in-xor-filter-device-tag.svg";

export default ({ data, fromSidebar, selected }) => {
  return (
    <Fragment>
      {selected && <SelectedNodeIcon />}
      <div
        style={{
          background: "#A6B8CC",
          padding: "10px 15px 10px 15px",
          borderRadius: 5,
          minWidth: 200,
          minHeight: 50,
          position: "relative",
        }}
      >
        {data.inXORFilter === false && (
          <Tooltip title="Device not yet in XOR filter">
            <img
              draggable="false"
              src={inXORFilterDeviceTag}
              style={{
                top: "-11px",
                left: "-11px",
                position: "absolute",
              }}
            />
          </Tooltip>
        )}
        <div
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <img
                draggable="false"
                src={DeviceIcon}
                style={{ height: 14, marginRight: 8 }}
              />
              <Text
                style={{
                  display: "block",
                  fontSize: 16,
                  color: "#ffffff",
                  fontWeight: 500,
                }}
              >
                {data.label}
              </Text>
            </div>
          </span>
          <div>
            {data.multi_buy_id && (
              <img
                draggable="false"
                src={MultiBuyTag}
                style={{
                  height: 20,
                  marginLeft: 4,
                  position: "relative",
                }}
              />
            )}
            {data.hasAlerts && (
              <img
                draggable="false"
                src={AlertTag}
                style={{
                  height: 20,
                  marginLeft: 4,
                  position: "relative",
                }}
              />
            )}
            {data.config_profile_id && (
              <img
                draggable="false"
                src={ProfileTag}
                style={{
                  height: 20,
                  marginLeft: 4,
                  position: "relative",
                }}
              />
            )}
          </div>
        </div>

        {!fromSidebar && (
          <Handle
            type="source"
            position="right"
            style={{
              borderRadius: 10,
              background: "#ffffff",
              border: "3.5px solid #A6B8CC",
              height: "12px",
              width: "12px",
            }}
          />
        )}
        {fromSidebar && (
          <div
            style={{
              height: 12,
              width: 12,
              backgroundColor: "white",
              borderRadius: 6,
              position: "absolute",
              top: "calc(50% - 6px)",
              right: -4,
              border: "3.5px solid #A6B8CC",
            }}
          />
        )}
      </div>
    </Fragment>
  );
};
