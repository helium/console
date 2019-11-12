import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Link } from 'react-router-dom'
import throttle from 'lodash/throttle'
import startCase from 'lodash/startCase'
import { logOut } from '../../actions/auth'
import SearchBar from '../search/SearchBar'
import NotificationsBar from '../notifications/NotificationsBar'

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
import Slide from '@material-ui/core/Slide'
import IconButton from '@material-ui/core/IconButton'

// Icons
import AccountCircle from '@material-ui/icons/AccountCircle'
import ImageIcon from '@material-ui/icons/Image'

const roleText = (role) => {
  switch(role) {
    case "admin":
      return "Administrator"
    case "manager":
      return "Manager"
  }
}

@connect(mapStateToProps, mapDispatchToProps)
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
    const { classes, email, role, title, logOut, currentOrganizationName, currentTeam } = this.props
    const { anchorEl, teamMenuOpen, accountMenuOpen, atTop, scrollPosition } = this.state

    return (
      <AppBar position="absolute" className={classes.appBar} elevation={atTop ? 0 : 2}>
        <Toolbar style={{minHeight: 48}}>
          {
            currentTeam && currentOrganizationName && (
              <span>
                <Typography variant="subheading" color="inherit">
                  Organization: {startCase(currentOrganizationName)}
                </Typography>
                <Typography variant="subheading" color="inherit">
                  Team: {startCase(currentTeam.name)}
                </Typography>
              </span>
            )
          }

          <Slide direction="up" in={!atTop}>
            <Typography variant="subheading" color="inherit" style={{marginLeft: 16}}>
              {title}
            </Typography>
          </Slide>

          <div style={{flex: 1}} />
          <SearchBar />

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
    currentOrganizationName: state.auth.currentOrganizationName,
    currentTeam: state.entities.teams[state.auth.currentTeamId],
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ logOut }, dispatch);
}

export default TopBar
