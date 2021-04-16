import React, { Component } from 'react'
import { withRouter, Link, NavLink } from 'react-router-dom'
import { push } from 'connected-react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Menu, Typography } from 'antd'
import Caret from '../../../img/menu-caret.svg'
import CaretD from '../../../img/menu-caret-device.svg'
import CaretF from '../../../img/menu-caret-function.svg'
import CaretC from '../../../img/menu-caret-channel.svg'
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
          <NavLink draggable="false" to={"/flows"} activeClassName="is-active" className="menu-link">Flows</NavLink>
          {history.location.pathname === '/flows' && <img draggable="false" src={Caret} style={{ right: -16, position: 'absolute', top: 8, height: 12 }} />}
        </div>
        <div><Text className="noselect" style={{ fontWeight: 500, fontSize: 12, color: '#9d9d9d' }}>NODES</Text></div>
        <div style={{ position: 'relative' }}>
          <NavLink draggable="false" to={"/devices"} activeClassName="is-active" className="menu-link-device">Devices</NavLink>
          {history.location.pathname.indexOf('/devices') !== -1 && <img draggable="false" src={CaretD} style={{ right: -16, position: 'absolute', top: 8, height: 12 }} />}
        </div>
        <div style={{ position: 'relative' }}>
          <NavLink draggable="false" to={"/functions"} activeClassName="is-active" className="menu-link-function">Functions</NavLink>
          {history.location.pathname.indexOf('/functions') !== -1 && <img draggable="false" src={CaretF} style={{ right: -16, position: 'absolute', top: 8, height: 12 }} />}
        </div>
        <div style={{ marginBottom: 30, position: 'relative' }}>
          <NavLink draggable="false" to={"/integrations"} activeClassName="is-active" className="menu-link-channel">Integrations</NavLink>
          {history.location.pathname.indexOf('/integrations') !== -1 && <img draggable="false" src={CaretC} style={{ right: -16, position: 'absolute', top: 8, height: 12 }} />}
        </div>
        <div><Text className="noselect" style={{ fontWeight: 500, fontSize: 12, color: '#9d9d9d' }}>CONFIGS</Text></div>
        <div style={{ position: 'relative' }}>
          <NavLink draggable="false" to={"/notifications"} activeClassName="is-active" className="menu-link">Notifications</NavLink>
          {history.location.pathname === '/notifications' && <img draggable="false" src={Caret} style={{ right: -16, position: 'absolute', top: 8, height: 12 }} />}
        </div>
        <div style={{ position: 'relative' }}>
          <NavLink draggable="false" to={"/adr"} activeClassName="is-active" className="menu-link">ADR</NavLink>
          {history.location.pathname === '/adr' && <img draggable="false" src={Caret} style={{ right: -16, position: 'absolute', top: 8, height: 12 }} />}
        </div>
        <div style={{ marginBottom: 30, position: 'relative' }}>
          <NavLink draggable="false" to={"/multiple-packets"} activeClassName="is-active" className="menu-link">Multiple Packets</NavLink>
          {history.location.pathname === '/multiple-packets' && <img draggable="false" src={Caret} style={{ right: -16, position: 'absolute', top: 8, height: 12 }} />}
        </div>
        <div><Text className="noselect" style={{ fontWeight: 500, fontSize: 12, color: '#9d9d9d' }}>ADMIN</Text></div>
        <div style={{ position: 'relative' }}>
          <NavLink draggable="false" to={"/organizations"} activeClassName="is-active" className="menu-link">Organizations</NavLink>
          {history.location.pathname === '/organizations' && <img draggable="false" src={Caret} style={{ right: -16, position: 'absolute', top: 8, height: 12 }} />}
        </div>
        <div style={{ position: 'relative' }}>
          <NavLink draggable="false" to={"/datacredits"} activeClassName="is-active" className="menu-link">Data Credits</NavLink>
          {history.location.pathname === '/datacredits' && <img draggable="false" src={Caret} style={{ right: -16, position: 'absolute', top: 8, height: 12 }} />}
        </div>
        <div style={{ position: 'relative' }}>
          <NavLink draggable="false" to={"/users"} activeClassName="is-active" className="menu-link">Users</NavLink>
          {history.location.pathname === '/users' && <img draggable="false" src={Caret} style={{ right: -16, position: 'absolute', top: 8, height: 12 }} />}
        </div>
      </div>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ push }, dispatch)
}

export default withRouter(connect(null, mapDispatchToProps)(NavDrawer))
