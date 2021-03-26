import React, { Component } from 'react'
import { withRouter, Link, NavLink } from 'react-router-dom'
import { push } from 'connected-react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Menu, Typography } from 'antd'
import Caret from '../../../img/menu-caret.svg'
const { Text } = Typography
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
      <div style={{ backgroundColor: '#F5F7F9', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', paddingRight: 40}}>
        <div style={{ marginBottom: 30, position: 'relative' }}>
          <NavLink to={"/flows"} activeClassName="is-active" className="menu-link">Flows</NavLink>
          {history.location.pathname === '/flows' && <img src={Caret} style={{ right: -16, position: 'absolute', top: 8, height: 12 }} />}
        </div>
        <div><Text style={{ fontWeight: 500, fontSize: 12, color: '#9d9d9d' }}>NODES</Text></div>
        <div style={{ position: 'relative' }}>
          <NavLink to={"/devices"} activeClassName="is-active" className="menu-link">Devices</NavLink>
          {history.location.pathname.indexOf('/devices') !== -1 && <img src={Caret} style={{ right: -16, position: 'absolute', top: 8, height: 12 }} />}
        </div>
        <div style={{ position: 'relative' }}>
          <NavLink to={"/functions"} activeClassName="is-active" className="menu-link">Functions</NavLink>
          {history.location.pathname.indexOf('/functions') !== -1 && <img src={Caret} style={{ right: -16, position: 'absolute', top: 8, height: 12 }} />}
        </div>
        <div style={{ position: 'relative' }}>
          <NavLink to={"/labels"} activeClassName="is-active" className="menu-link">Labels</NavLink>
          {history.location.pathname.indexOf('/labels') !== -1 && <img src={Caret} style={{ right: -16, position: 'absolute', top: 8, height: 12 }} />}
        </div>
        <div style={{ marginBottom: 30, position: 'relative' }}>
          <NavLink to={"/integrations"} activeClassName="is-active" className="menu-link">Integrations</NavLink>
          {history.location.pathname.indexOf('/integrations') !== -1 && <img src={Caret} style={{ right: -16, position: 'absolute', top: 8, height: 12 }} />}
        </div>
        <div><Text style={{ fontWeight: 500, fontSize: 12, color: '#9d9d9d' }}>ADMIN</Text></div>
        <div style={{ position: 'relative' }}>
          <NavLink to={"/organizations"} activeClassName="is-active" className="menu-link">Organizations</NavLink>
          {history.location.pathname === '/organizations' && <img src={Caret} style={{ right: -16, position: 'absolute', top: 8, height: 12 }} />}
        </div>
        <div style={{ position: 'relative' }}>
          <NavLink to={"/datacredits"} activeClassName="is-active" className="menu-link">Data Credits</NavLink>
          {history.location.pathname === '/datacredits' && <img src={Caret} style={{ right: -16, position: 'absolute', top: 8, height: 12 }} />}
        </div>
        <div style={{ position: 'relative' }}>
          <NavLink to={"/users"} activeClassName="is-active" className="menu-link">Users</NavLink>
          {history.location.pathname === '/users' && <img src={Caret} style={{ right: -16, position: 'absolute', top: 8, height: 12 }} />}
        </div>
      </div>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ push }, dispatch)
}

export default withRouter(connect(null, mapDispatchToProps)(NavDrawer))
