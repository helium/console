import React, { Fragment } from "react";
import { Handle } from "react-flow-renderer";
import { Typography } from "antd";
const { Text } = Typography;
import LabelsIcon from "../../../../img/label-node-icon.svg";
import ProfileTag from "../../../../img/config_profile/profile_small_white.svg";
import MultiBuyTag from "../../../../img/multi_buy/multi-buy-node-tag.svg";
import AlertTag from "../../../../img/alerts/alert-node-tag.svg";
import SelectedNodeIcon from "./SelectedNodeIcon";
import LabelNotInFilterBadge from "../../common/LabelNotInFilterBadge";
import Warning from "../Warning";

export default ({ data, fromSidebar, selected }) => {
  return (
    <Fragment>
      {selected && <SelectedNodeIcon />}
      {!fromSidebar && data.deviceCount === 0 && <Warning numberWarnings={1} />}
      <div
        style={{
          background: "#2C79EE",
          padding: "10px 15px 10px 15px",
          borderRadius: 5,
          minWidth: 200,
          minHeight: 50,
          position: "relative",
        }}
      >
        {data.devicesNotInFilter && <LabelNotInFilterBadge />}
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
                src={LabelsIcon}
                draggable="false"
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
            <Text style={{ display: "block", fontSize: 12, color: "#ffffff" }}>
              {`${data.deviceCount || 0} Device${
                data.deviceCount === 0 || data.deviceCount > 1 ? "s" : ""
              }`}
            </Text>
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
                  top: -2,
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
                  top: -2,
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
                  top: -2,
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
              border: "3.5px solid #2C79EE",
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
              border: "3.5px solid #2C79EE",
            }}
          />
        )}
      </div>
    </Fragment>
  );
};
