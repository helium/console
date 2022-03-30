import React, { Component } from "react";
import { Menu } from "antd";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import { Link } from "react-router-dom";
import { connect } from "react-redux";

@connect(mapStateToProps, null)
class OrganizationMenu extends Component {
  render() {
    const { current, orgs, handleClick, role, dispatch, ...rest } = this.props;
    return (
      <Menu {...rest} onClick={handleClick} className="noselect">
        <Menu.ItemGroup title="Current Organization">
          <Menu.Item key="current">
            <Link draggable="false" to="/organizations">
              {current}
            </Link>
          </Menu.Item>
        </Menu.ItemGroup>
        {orgs.length > 0 && <Menu.Divider /> && (
          <Menu.ItemGroup
            title="Switch Organization"
            style={{ maxHeight: 175, overflowY: "scroll" }}
          >
            {orgs.map((org) => (
              <Menu.Item draggable="false" key={org.id}>
                {org.name}
              </Menu.Item>
            ))}
          </Menu.ItemGroup>
        )}
        {process.env.IMPOSE_HARD_CAP !== 'true' && role === "admin" && <Menu.Divider />}
        {process.env.IMPOSE_HARD_CAP !== 'true' && role === "admin" && (
          <Menu.Item key="new">
            <PlusOutlined /> New Organization
          </Menu.Item>
        )}
      </Menu>
    );
  }
}

function mapStateToProps(state) {
  return {
    role: state.organization.currentRole,
  };
}

export default OrganizationMenu;
