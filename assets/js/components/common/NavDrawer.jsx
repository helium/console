import React, { Component } from 'react'
import { withRouter, Link, NavLink } from 'react-router-dom'
import { push } from 'connected-react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Menu, Typography } from 'antd'
const SHOW_LABELS_KEY = 'showLabels';

class NavDrawer extends Component {
  state = {
    showLabels: localStorage.getItem(SHOW_LABELS_KEY) !== 'false'
  }

  handleClick = e => {
    this.props.push(e.key)
  }

  render() {
    const { history } = this.props
    return (
      <div>
        <Menu
          mode="inline"
          onClick={this.handleClick}
          style={{maxHeight: '82vh', overflowY: 'scroll'}}
        >
          <div><NavLink to={"/devices"} activeClassName="is-active" className="menu-link">Devices</NavLink></div>
          <div><NavLink to={"/integrations"} activeClassName="is-active" className="menu-link">Integrations</NavLink></div>
          <div><NavLink to={"/labels"} activeClassName="is-active" className="menu-link">Labels</NavLink></div>
          <div><NavLink to={"/functions"} activeClassName="is-active" className="menu-link">Functions</NavLink></div>
          <div><NavLink to={"/organizations"} activeClassName="is-active" className="menu-link">Organizations</NavLink></div>
          <div><NavLink to={"/users"} activeClassName="is-active" className="menu-link">Users</NavLink></div>
          <div><NavLink to={"/datacredits"} activeClassName="is-active" className="menu-link">Data Credits</NavLink></div>
          <div><NavLink to={"/flows"} activeClassName="is-active" className="menu-link">Flows (Beta)</NavLink></div>
        </Menu>
      </div>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ push }, dispatch)
}

export default withRouter(connect(null, mapDispatchToProps)(NavDrawer))
