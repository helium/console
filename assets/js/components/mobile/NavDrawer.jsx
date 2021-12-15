import React from "react";
import { withRouter, NavLink } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Typography } from 'antd';
const { Text } = Typography
import Logo from "../../../img/mobile/logo.svg";
import NavArrow from "../../../img/mobile/nav-drawer-arrow.svg";
import { updateDisplay } from '../../actions/display'

const NavDrawer = (props) => {
  const dispatch = useDispatch();

  return (
    <div
      style={{
        height: "100%",
        width: 300,
        paddingLeft: 25,
        backgroundColor: '#ffffff',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', position: 'absolute', top: 25, left: 25 }}>
          <img
            draggable="false"
            src={Logo}
            style={{ height: 40, width: 40, marginRight: 6 }}
          />
          <Text style={{ fontSize: 20, fontWeight: 600 }}>Console</Text>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
          <NavLink
            draggable="false"
            className="menu-link-mobile"
            activeClassName="is-active"
            to={"/welcome"}
          >
            Home
          </NavLink>
          {props.history.location.pathname.indexOf("/welcome") !== -1 && (
            <img
              draggable="false"
              src={NavArrow}
              style={{ height: 20, marginLeft: 6 }}
            />
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
          <NavLink
            draggable="false"
            className="menu-link-mobile"
            activeClassName="is-active"
            to={"/devices"}
            isActive={(_match, location) => {
              if (
                location.pathname.indexOf("/labels") !== -1 ||
                location.pathname.indexOf("/devices") !== -1
              )
                return true;
            }}
          >
            My Devices
          </NavLink>
          {(props.history.location.pathname.indexOf("/devices") !== -1 ||
            props.history.location.pathname.indexOf("/labels") !== -1) && (
            <img
              draggable="false"
              src={NavArrow}
              style={{ height: 20, marginLeft: 6 }}
            />
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
          <NavLink
            draggable="false"
            className="menu-link-mobile"
            activeClassName="is-active"
            to={"/integrations"}
          >
            Integrations
          </NavLink>
          {props.history.location.pathname.indexOf("/integrations") !== -1 && (
            <img
              draggable="false"
              src={NavArrow}
              style={{ height: 20, marginLeft: 6 }}
            />
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
          <NavLink
            draggable="false"
            className="menu-link-mobile"
            activeClassName="is-active"
            to={"/organizations"}
          >
            Organizations
          </NavLink>
          {props.history.location.pathname === "/organizations" && (
            <img
              draggable="false"
              src={NavArrow}
              style={{ height: 20, marginLeft: 6 }}
            />
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
          <NavLink
            draggable="false"
            className="menu-link-mobile"
            activeClassName="is-active"
            to={"/datacredits"}
          >
            Data Credits
          </NavLink>
          {props.history.location.pathname === "/datacredits" && (
            <img
              draggable="false"
              src={NavArrow}
              style={{ height: 20, marginLeft: 6 }}
            />
          )}
        </div>
        <div style={{ position: 'absolute', bottom: 25, left: 25 }}>
          <Text style={{ fontSize: 14, fontWeight: 600, display: 'block' }}>Need to do something else?</Text>
          <Text
            style={{ fontSize: 14, fontWeight: 600, display: 'block', color: '#2C79EE', cursor: 'pointer' }}
            onClick={() => dispatch(updateDisplay(true))}
          >
            Switch to Desktop View
          </Text>
        </div>
      </div>
    </div>
  )
}

export default withRouter(NavDrawer)
