import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import Drawer from 'material-ui/Drawer';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Divider from 'material-ui/Divider';

import List from 'material-ui/List';
import { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import InboxIcon from 'material-ui-icons/MoveToInbox';
import DraftsIcon from 'material-ui-icons/Drafts';
import StarIcon from 'material-ui-icons/Star';
import SendIcon from 'material-ui-icons/Send';
import MailIcon from 'material-ui-icons/Mail';
import DeleteIcon from 'material-ui-icons/Delete';
import ReportIcon from 'material-ui-icons/Report';

import DevicesIcon from 'material-ui-icons/DeviceHub';
import GatewaysIcon from 'material-ui-icons/Router';
import ChannelsIcon from 'material-ui-icons/CompareArrows';

const mailFolderListItems = (
  <div>
    <ListItem button component={Link} to="/devices">
      <ListItemIcon>
        <DevicesIcon />
      </ListItemIcon>
      <ListItemText primary="Devices" />
    </ListItem>

    <ListItem button component={Link} to="/gateways">
      <ListItemIcon>
        <GatewaysIcon />
      </ListItemIcon>
      <ListItemText primary="Gateways" />
    </ListItem>

    <ListItem button component={Link} to="/channels">
      <ListItemIcon>
        <ChannelsIcon />
      </ListItemIcon>
      <ListItemText primary="Channels" />
    </ListItem>
  </div>
);

const otherMailFolderListItems = (
  <div>
    <ListItem button>
      <ListItemIcon>
        <MailIcon />
      </ListItemIcon>
      <ListItemText primary="All mail" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <DeleteIcon />
      </ListItemIcon>
      <ListItemText primary="Trash" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <ReportIcon />
      </ListItemIcon>
      <ListItemText primary="Spam" />
    </ListItem>
  </div>
);

class NavDrawer extends Component {

  render() {
    const { classes } = this.props

    return (
      <Drawer
        variant="permanent"
        classes={{ paper: classes.drawerPaper }}
      >
        <Toolbar>
          <Link to="/" className={classes.logo}>
            <img src="/images/logo-horizontalwhite.svg" style={{width: "50%", marginTop: 6}} />
          </Link>
        </Toolbar>
        <Divider />
        <List>{mailFolderListItems}</List>
        <Divider />
        <List>{otherMailFolderListItems}</List>
      </Drawer>
    )
  }
}

export default NavDrawer
