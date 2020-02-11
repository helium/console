import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import Logo from '../../../img/logo-horizontalwhite.svg'
import { Link } from 'react-router-dom';
import { push } from 'connected-react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Menu, Icon, Typography } from 'antd'
const { SubMenu } = Menu
const { Text } = Typography
import { graphql } from 'react-apollo';
import { MENU_LABELS } from '../../graphql/labels'
import { labelColorsHex } from './LabelTag'

@withRouter
@graphql(MENU_LABELS, {})
@connect(null, mapDispatchToProps)
class NavDrawer extends Component {
  handleClick = e => {
    this.props.push(e.key)
  }

  render() {
    const { history, data } = this.props
    console.log(data.allLabels)
    return (
      <div>
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
        <div style={{ position: "absolute", top: 330, left: 24 }}>
          {
            data.allLabels && data.allLabels.map(l => (
              <Link to={`/labels/${l.id}`} key={l.id}>
                <LabelRow text={l.name} color={l.color}/>
              </Link>
            ))
          }
        </div>
      </div>
    )
  }
}

const LabelRow = ({ text, color }) => (
  <div>
    <Icon type="tag" theme="filled" style={{ color: color ? labelColorsHex[color] : labelColorsHex['geekblue'], marginRight: 10  }} />
    <Text style={{ color: 'white', fontSize: 12 }}>{text}</Text>
  </div>
)

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ push }, dispatch)
}

export default NavDrawer
