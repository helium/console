import React, { Component } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router-dom'

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

class TopBar extends Component {
  constructor(props) {
    super(props)

    this.state = {
      anchorEl: null,
    }

    this.handleMenu = this.handleMenu.bind(this)
    this.handleClose = this.handleClose.bind(this)
  }

  handleMenu(event) {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose() {
    this.setState({ anchorEl: null });
  };

  render() {
    const { classes, email, title, logOut } = this.props
    const { anchorEl } = this.state
    const open = Boolean(anchorEl)

    return (
      <AppBar position="absolute" className={classes.appBar}>
        <Toolbar>
          <Typography variant="title" style={{flex: 1}}>
            {title}
          </Typography>

          <div>
            <IconButton onClick={this.handleMenu}>
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
              open={open}
              onClose={this.handleClose}
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
