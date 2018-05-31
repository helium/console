import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Link } from 'react-router-dom'
import throttle from 'lodash/throttle'
import TeamSwitcher from './TeamSwitcher'
import { logOut } from '../../actions/auth'
import { fetchUser } from '../../actions/user';
import SearchBar from '../search/SearchBar'

// MUI
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Avatar from '@material-ui/core/Avatar'
import Badge from '@material-ui/core/Badge'
import Button from '@material-ui/core/Button'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import { withStyles } from '@material-ui/core/styles'
import Slide from '@material-ui/core/Slide'
import IconButton from '@material-ui/core/IconButton'
import SmallBadge from './SmallBadge'

// Icons
import AccountCircle from '@material-ui/icons/AccountCircle'
import NotificationsIcon from '@material-ui/icons/Notifications'
import ImageIcon from '@material-ui/icons/Image'

const roleText = (role) => {
  switch(role) {
    case "admin":
      return "Administrator"
    case "developer":
      return "Developer"
    case "analyst":
      return "Analyst"
    case "viewer":
      return "View Only"
  }
}


class TopBar extends Component {
  constructor(props) {
    super(props)

    this.state = {
      anchorEl: null,
      accountMenuOpen: false,
      scrollPosition: 0, // pixels from top of page
      atTop: true
    }

    this.openAccountMenu = this.openAccountMenu.bind(this)
    this.closeAccountMenu = this.closeAccountMenu.bind(this)
    this.updateScrollPosition = throttle(
      this.updateScrollPosition.bind(this),
      10
    )
  }

  componentDidMount() {
    window.addEventListener('scroll', this.updateScrollPosition, true)
    this.props.fetchUser()
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.updateScrollPosition, true)
  }

  openAccountMenu(event) {
    this.setState({ anchorEl: event.currentTarget, accountMenuOpen: true });
  };

  closeAccountMenu() {
    this.setState({ anchorEl: null, accountMenuOpen: false });
  };

  updateScrollPosition(event) {
    if (event.target.id == 'mainContainer') {
      this.setState({
        scrollPosition: event.target.scrollTop,
        atTop: event.target.scrollTop <= 10
      })
    }
  }

  render() {
    const { classes, email, role, title, logOut } = this.props
    const { anchorEl, teamMenuOpen, accountMenuOpen, atTop, scrollPosition } = this.state

    return (
      <AppBar position="absolute" className={classes.appBar} elevation={atTop ? 0 : 2}>
        <Toolbar style={{minHeight: 48}}>
          <div>
            <TeamSwitcher />
          </div>

          <Slide direction="up" in={!atTop}>
            <Typography variant="subheading" color="inherit" style={{marginLeft: 16}}>
              {title}
            </Typography>
          </Slide>

          <div style={{flex: 1}} />

          <SearchBar />

          <IconButton onClick={() => alert('oh hai')} color="inherit">
            <SmallBadge badgeContent={3} color="secondary">
              <NotificationsIcon />
            </SmallBadge>
          </IconButton>

          <div>
            <IconButton onClick={this.openAccountMenu} color="inherit">
              <AccountCircle />
            </IconButton>

            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={accountMenuOpen}
              onClose={this.closeAccountMenu}
            >
              <ListItem>
                <Avatar>
                  {email === null ? "U" : email[0].toUpperCase()}
                </Avatar>
                <ListItemText primary={email} secondary={roleText(role)}/>
              </ListItem>
              <MenuItem component={Link} to="/profile">Profile</MenuItem>
              <MenuItem onClick={logOut}>Log Out</MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {
    email: state.user.email,
    role: state.user.role,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ logOut, fetchUser }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(TopBar);
