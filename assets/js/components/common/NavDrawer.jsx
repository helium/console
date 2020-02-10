import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import Logo from '../../../img/logo-horizontalwhite.svg'
import { push } from 'connected-react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Menu, Icon } from 'antd'
const { SubMenu } = Menu

@withRouter
@connect(null, mapDispatchToProps)
class NavDrawer extends Component {
  handleClick = e => {
    this.props.push(e.key)
  }

  render() {
    const { history } = this.props
    return (
      <Menu
        mode="inline"
        theme="dark"
        onClick={this.handleClick}
      >
        <Menu.Item disabled={history.location.pathname === "/dashboard"} key="/dashboard"><Icon type="dashboard"/>Dashboard</Menu.Item>
        <Menu.Item disabled={history.location.pathname === "/devices"} key="/devices"><Icon type="appstore" />Devices</Menu.Item>
        <Menu.Item disabled={history.location.pathname === "/integrations"} key="/integrations"><Icon type="api" />Integrations</Menu.Item>
        <Menu.Item disabled={history.location.pathname === "/users"} key="/users"><Icon type="user" />Users</Menu.Item>
        <Menu.Item disabled={history.location.pathname === "/datacredits"} key="/datacredits"><Icon type="wallet" />Data Credits</Menu.Item>
        <Menu.Item disabled={history.location.pathname === "/labels"} key="/labels"><Icon type="tag" />Labels</Menu.Item>
      </Menu>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ push }, dispatch)
}

export default NavDrawer
