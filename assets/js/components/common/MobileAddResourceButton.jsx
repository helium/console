import React from "react";
import { Popover } from "antd";
import { NavLink } from "react-router-dom";
import PlusCircleFilled from "@ant-design/icons/PlusCircleFilled";
import UserCan from "../common/UserCan";

export default () => {
  return (
    <UserCan>
      <Popover
        overlayClassName="add-menu-popover"
        trigger="click"
        content={
          <div style={{ width: 150 }}>
            <NavLink
              draggable="false"
              className="add-menu-selection noselect"
              activeClassName="is-active"
              to={"/devices/new"}
              style={{ fontSize: 18 }}
            >
              Add Device
            </NavLink>
            <NavLink
              draggable="false"
              className="add-menu-selection noselect"
              activeClassName="is-active"
              to={"/devices/new_label"}
              style={{ fontSize: 18 }}
            >
              Add Label
            </NavLink>
            <NavLink
              draggable="false"
              className="add-menu-selection noselect"
              activeClassName="is-active"
              to={"/integrations/new"}
              style={{ fontSize: 18 }}
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
            bottom: 15,
            right: 15,
            fontSize: 40,
            cursor: "pointer",
            zIndex: 100,
          }}
        />
      </Popover>
    </UserCan>
  );
};
