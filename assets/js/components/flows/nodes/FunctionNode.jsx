import React, { Fragment } from "react";
import { Handle } from "react-flow-renderer";
import { Typography } from "antd";
const { Text } = Typography;
import FunctionIcon from "../../../../img/function-node-icon.svg";
import SelectedNodeIcon from "./SelectedNodeIcon";
import AlertTag from "../../../../img/alerts/alert-node-tag.svg";
import { functionFormats, getAllowedFunctions } from '../../../util/functionInfo';
import Warning from "../Warning";

export default ({ data, fromSidebar, selected }) => {
  const allowedFunctions = getAllowedFunctions()
  let warningCount = 0
  if (allowedFunctions && !allowedFunctions[data.format]) warningCount++

  return (
    <Fragment>
      {selected && <SelectedNodeIcon />}
      {!fromSidebar && warningCount > 0 && (
        <Warning numberWarnings={warningCount} />
      )}
      <div
        style={{
          background: "#9E59F6",
          padding: "10px 15px 5px 15px",
          borderRadius: 5,
          minWidth: 200,
          minHeight: 50,
          position: "relative",
        }}
      >
        {!fromSidebar && (
          <Handle
            type="target"
            position="left"
            style={{
              height: "100%",
              borderRadius: 10,
              background: "#ffffff",
              border: "3.5px solid #9E59F6",
              height: "12px",
              width: "12px",
            }}
          />
        )}

        {!fromSidebar && (
          <Handle
            type="source"
            position="right"
            style={{
              height: "100%",
              borderRadius: 10,
              background: "#ffffff",
              border: "3.5px solid #9E59F6",
              height: "12px",
              width: "12px",
            }}
            isValidConnection={(connection) =>
              connection.target.slice(0, 8) !== "function"
            }
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
              border: "3.5px solid #9E59F6",
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
              left: -4.5,
              border: "3.5px solid #9E59F6",
            }}
          />
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
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <img
                draggable="false"
                src={FunctionIcon}
                style={{ height: 16, marginRight: 6 }}
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
            <Text
              style={{
                fontSize: 10,
                color: "#ffffff",
                position: "relative",
                top: -5,
              }}
            >
              {functionFormats[data.format]}
            </Text>
          </span>
          <div style={{ marginLeft: 10 }}>
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
          </div>
        </div>
      </div>
    </Fragment>
  );
};
