import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Link } from 'react-router-dom'
import throttle from 'lodash/throttle'
import TeamSwitcher from './TeamSwitcher'
import { logOut } from '../../actions/auth'
import { fetchUser } from '../../actions/user';

// MUI
import List, { ListItem, ListItemText } from 'material-ui/List'
import Avatar from 'material-ui/Avatar'
import Badge from 'material-ui/Badge'
import Button from 'material-ui/Button'
import AppBar from 'material-ui/AppBar'
import Toolbar from 'material-ui/Toolbar'
import Typography from 'material-ui/Typography'
import Menu, { MenuItem } from 'material-ui/Menu'
import { withStyles } from 'material-ui/styles'
import SmallBadge from './SmallBadge'
import Slide from 'material-ui/transitions/Slide'

// Icons
import AccountCircle from 'material-ui-icons/AccountCircle'
import NotificationsIcon from 'material-ui-icons/Notifications'
import ImageIcon from 'material-ui-icons/Image'
import IconButton from 'material-ui/IconButton'


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
    // console.log('scroll pos:', event.target.scrollTop)
    this.setState({
      scrollPosition: event.target.scrollTop,
      atTop: event.target.scrollTop <= 10
    })
  }

  render() {
    const { classes, email, title, logOut } = this.props
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
                <ListItemText primary={email} secondary="Administrator" />
              </ListItem>
              <MenuItem component={Link} to="/secret">Profile</MenuItem>
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
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ logOut, fetchUser }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(TopBar);
