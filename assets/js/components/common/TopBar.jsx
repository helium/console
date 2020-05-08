import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Link } from 'react-router-dom';
import { push } from 'connected-react-router';
import { logOut } from '../../actions/auth'
import SearchBar from '../search/SearchBar'
import analyticsLogger from '../../util/analyticsLogger'
import { primaryBlue, redForTablesDeleteText } from '../../util/colors'
import { Menu, Dropdown, Icon, Typography } from 'antd';
const { Text } = Typography
import Logo from '../../../img/logo-horizontalwhite.svg'
import ProfileActive from '../../../img/topbar-pf-active.png'
import ProfileInactive from '../../../img/topbar-pf-inactive.png'


@connect(mapStateToProps, mapDispatchToProps)
class TopBar extends Component {
  state = {
    visible: false,
  }

  handleClick = e => {
    if (e.key === 'logout') {
      analyticsLogger.logEvent("ACTION_LOGOUT", { "email": this.props.email })
      this.props.logOut()
    } else {
      this.props.push(e.key)
    }
  }

  render() {
    const { logOut, currentOrganizationName } = this.props

    return (
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <img src={Logo} style={{height:30}}/>
        </div>
        {
          currentOrganizationName && <SearchBar />
        }
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <Link to="/welcome">
            <Icon type="home" style={{ color: '#ffffff', fontSize: 18 }}/>
          </Link>
          <Dropdown overlay={menu(this.handleClick, currentOrganizationName)} trigger={['click']} onVisibleChange={visible => this.setState({ visible })}>
            <img src={this.state.visible ? ProfileActive : ProfileInactive} style={{ height:30, marginLeft: 15, cursor: 'pointer' }}/>
          </Dropdown>
        </div>
      </div>
    )
  }
}

const menu = (handleClick, currentOrganizationName) => (
  <Menu onClick={handleClick} style={{ textAlign: 'right' }}>
    {
      currentOrganizationName && (
        <Menu.Item key="/organizations">
          <Text>Organization: <span style={{ color: primaryBlue }}>{currentOrganizationName}</span></Text>
        </Menu.Item>
      )
    }
    {
      currentOrganizationName && (
        <Menu.Item key="/profile">
          <Text>My Account</Text>
        </Menu.Item>
      )
    }
    <Menu.Item key="logout">
      <Text style={{ color: redForTablesDeleteText }}>Log Out</Text>
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
