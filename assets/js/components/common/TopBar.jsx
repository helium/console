import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { push } from 'connected-react-router';
import { logOut } from '../../actions/auth'
import SearchBar from '../search/SearchBar'
import analyticsLogger from '../../util/analyticsLogger'
import { Menu, Dropdown, Icon, Typography } from 'antd';
const { Text } = Typography

@connect(mapStateToProps, mapDispatchToProps)
class TopBar extends Component {
  handleClick = e => {
    if (e.key === 'logout') {
      analyticsLogger.logEvent("ACTION_LOGOUT", { "email": this.props.email })
      this.props.logOut()
    } else this.props.push(e.key)
  }

  render() {
    const { logOut, currentOrganizationName, currentTeam } = this.props

    return (
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div>
          {
            currentOrganizationName && <Text style={{ color: 'white' }}>Organization: {currentOrganizationName}</Text>
          }
          {
            currentTeam && <Text style={{ color: 'white' }}> - Team: {this.props.currentTeam.name}</Text>
          }
        </div>
        <div style={{ flexGrow: 1 }}/>
        <SearchBar />
        <div style={{ width: 20 }}/>
        <Dropdown overlay={menu(this.handleClick)}>
          <a className="ant-dropdown-link" href="#">
            Account <Icon type="down" />
          </a>
        </Dropdown>,
      </div>
    )
  }
}

const menu = handleClick => (
  <Menu onClick={handleClick}>
    <Menu.Item key="/profile">
      Profile
    </Menu.Item>
    <Menu.Item key="logout">
      Log Out
    </Menu.Item>
  </Menu>
)

function mapStateToProps(state, ownProps) {
  return {
    email: state.user.email,
    currentOrganizationName: state.auth.currentOrganizationName,
    currentTeam: state.entities.teams[state.auth.currentTeamId],
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ logOut, push }, dispatch);
}

export default TopBar
