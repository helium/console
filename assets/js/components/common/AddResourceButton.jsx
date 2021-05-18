import React from "react";
import { Popover } from "antd";
import { NavLink } from "react-router-dom";
import { PlusCircleFilled } from "@ant-design/icons";
import UserCan from "../common/UserCan";

export default ({
  deviceCallback,
  labelCallback,
  functionCallback,
  channelCallback,
}) => {
  return (
    <UserCan>
      <Popover
        overlayClassName="add-menu-popover"
        content={
          <div style={{ width: 130 }}>
            <NavLink
              draggable="false"
              className="add-menu-selection noselect"
              activeClassName="is-active"
              onClick={deviceCallback}
              to={"/devices/new"}
            >
              Add Device
            </NavLink>
            <NavLink
              draggable="false"
              className="add-menu-selection noselect"
              activeClassName="is-active"
              onClick={labelCallback}
              to={"/devices/new_label"}
            >
              Add Label
            </NavLink>
            <NavLink
              draggable="false"
              className="add-menu-selection noselect"
              activeClassName="is-active"
              onClick={functionCallback}
              to={"/functions/new"}
            >
              Add Function
            </NavLink>
            <NavLink
              draggable="false"
              className="add-menu-selection noselect"
              activeClassName="is-active"
              onClick={channelCallback}
              to={"/integrations/new"}
            >
              Add Integration
            </NavLink>
          </div>
        }
        placement="left"
      >
        <PlusCircleFilled
          style={{
            position: "absolute",
            bottom: 100,
            right: 30,
            fontSize: 40,
            cursor: "pointer",
            zIndex: 100,
          }}
        />
      </Popover>
    </UserCan>
  );
};
