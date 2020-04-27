import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { push } from 'connected-react-router';
import { logOut } from '../../actions/auth'
import SearchBar from '../search/SearchBar'
import analyticsLogger from '../../util/analyticsLogger'
import { primaryBlue } from '../../util/colors'
import { Menu, Dropdown, Icon, Typography } from 'antd';
const { Text } = Typography
import Logo from '../../../img/logo-horizontalwhite.svg'


@connect(mapStateToProps, mapDispatchToProps)
class TopBar extends Component {
  handleClick = e => {
    if (e.key === 'logout') {
      analyticsLogger.logEvent("ACTION_LOGOUT", { "email": this.props.email })
      this.props.logOut()
    } else this.props.push(e.key)
  }

  render() {
    const { logOut, currentOrganizationName } = this.props

    return (
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      <div style={{width: 210}}>
                <img src={Logo} style={{height:30}}/>
                </div>
        <div>
          {
            currentOrganizationName && <Text style={{ color: primaryBlue, marginRight: 20 }}><span style={{fontWeight:500, color:'white'}}>Organization:</span> {currentOrganizationName}</Text>
          }
        </div>
        <div style={{ flexGrow: 1 }}/>
        {
          currentOrganizationName && <SearchBar />
        }
        <div style={{ width: 20 }}/>
        <Dropdown overlay={menu(this.handleClick, !!currentOrganizationName)}>
          <Text style={{ color: 'white', cursor: 'pointer' }}>
            Account <Icon type="down" />
          </Text>
        </Dropdown>
      </div>
    )
  }
}

const menu = (handleClick, showProfile) => (
  <Menu onClick={handleClick}>
    {
      showProfile && (
        <Menu.Item key="/profile">
          <Icon type="profile" /> Profile
        </Menu.Item>
      )
    }
    <Menu.Item key="logout">
      <Icon type="logout" /> Log Out
    </Menu.Item>
  </Menu>
)

function mapStateToProps(state, ownProps) {
  return {
    email: state.user.email,
    currentOrganizationName: state.organization.currentOrganizationName,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ logOut, push }, dispatch);
}

export default TopBar
