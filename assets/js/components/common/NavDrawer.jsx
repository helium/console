import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import Drawer from 'material-ui/Drawer';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Divider from 'material-ui/Divider';

import { withStyles } from 'material-ui/styles';

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
import AccessIcon from 'material-ui-icons/People';
import BillingIcon from 'material-ui-icons/CreditCard';
import DashboardIcon from 'material-ui-icons/Dashboard';
import ReportsIcon from 'material-ui-icons/TrackChanges';

import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
const theme = createMuiTheme({
  palette: {
    type: 'dark',
    background: {
      default: "#ff0000"
    }
  },
});

const hardwareItems = (
  <div>
    <ListItem button component={Link} to="/devices">
      <ListItemIcon>
        <DashboardIcon />
      </ListItemIcon>
      <ListItemText primary="Dashboard" />
    </ListItem>

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

const organizationItems = (
  <div>
    <ListItem button>
      <ListItemIcon>
        <AccessIcon />
      </ListItemIcon>
      <ListItemText primary="Access" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <BillingIcon />
      </ListItemIcon>
      <ListItemText primary="Billing" />
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <ReportsIcon />
      </ListItemIcon>
      <ListItemText primary="Reports" />
    </ListItem>
  </div>
);

const drawerWidth = 240;
const styles = theme => ({
  drawerPaper: {
    position: 'relative',
    width: drawerWidth,
    // backgroundColor: theme.palette.background.default,
    backgroundColor: "#27303D",
  },
  logo: {
    display: 'block',
    width: '100%',
  },
})

class NavDrawer extends Component {

  render() {
    const { classes } = this.props

    // const drawerPaper = Object.assign({}, classes.drawerPaper, {backgroundColor: '#ff0000'})

    return (
      <MuiThemeProvider theme={theme}>
        <Drawer
          variant="permanent"
          classes={{ paper: classes.drawerPaper }}
        >
          <Toolbar style={{minHeight: 48}}>
            <Link to="/" className={classes.logo}>
              <img src="/images/logo-horizontalwhite.svg" style={{width: "45%"}} />
            </Link>
          </Toolbar>
          <Divider />
          <List>{hardwareItems}</List>
          <Divider />
          <List>{organizationItems}</List>
        </Drawer>
      </MuiThemeProvider>
    )
  }
}

export default withStyles(styles)(NavDrawer)
