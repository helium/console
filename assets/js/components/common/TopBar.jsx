import React, { Component } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router-dom'

import TeamSwitcher from './TeamSwitcher'

import { logOut } from '../../actions/auth';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Menu, { MenuItem } from 'material-ui/Menu';

import { withStyles } from 'material-ui/styles';

import AccountCircle from 'material-ui-icons/AccountCircle';
import IconButton from 'material-ui/IconButton';

import List, { ListItem, ListItemText } from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import ImageIcon from 'material-ui-icons/Image';
import NotificationsIcon from 'material-ui-icons/Notifications';
import Badge from 'material-ui/Badge';
import Button from 'material-ui/Button'

class TopBar extends Component {
  constructor(props) {
    super(props)

    this.state = {
      anchorEl: null,
      accountMenuOpen: false
    }

    this.openAccountMenu = this.openAccountMenu.bind(this)
    this.closeAccountMenu = this.closeAccountMenu.bind(this)
  }

  openAccountMenu(event) {
    this.setState({ anchorEl: event.currentTarget, accountMenuOpen: true });
  };

  closeAccountMenu() {
    this.setState({ anchorEl: null, accountMenuOpen: false });
  };

  render() {
    const { classes, email, title, logOut } = this.props
    const { anchorEl, teamMenuOpen, accountMenuOpen } = this.state

    return (
      <AppBar position="absolute" className={classes.appBar} elevation={0}>
        <Toolbar>
          <div style={{flex: 1}}>
            <TeamSwitcher />
          </div>


          <IconButton onClick={() => alert('oh hai')} color="inherit">
            <Badge badgeContent={3} color="secondary">
              <NotificationsIcon />
            </Badge>
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
    email: state.user.email
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ logOut }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(TopBar);
