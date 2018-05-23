import React, { Component } from 'react'
import { Link } from 'react-router-dom'

// MUI
import Drawer from '@material-ui/core/Drawer';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { withStyles } from '@material-ui/core/styles';
import userCan from '../../util/abilities'

// Icons
import DevicesIcon from '@material-ui/icons/Memory';
import GatewaysIcon from '@material-ui/icons/Router';
import ChannelsIcon from '@material-ui/icons/CompareArrows';
import AccessIcon from '@material-ui/icons/People';
import BillingIcon from '@material-ui/icons/CreditCard';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ReportsIcon from '@material-ui/icons/TrackChanges';

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
const theme = createMuiTheme({
  palette: {
    type: 'dark',
    background: {
      default: "#ff0000"
    }
  },
});

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

const HardwareNavItems = (props) => (
  <List>
    <ListItem button component={Link} to="/dashboard">
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
  </List>
)

const OrganizationalNavItems = (props) => (
  <List>
    <ListItem button component={Link} to="/teams/access">
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
    {
      userCan('view', 'auditTrails') &&
      <ListItem button component={Link} to="/audit">
        <ListItemIcon>
          <ReportsIcon />
        </ListItemIcon>
        <ListItemText primary="Audit Trails" />
      </ListItem>
    }
  </List>
)

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
          <HardwareNavItems />
          <Divider />
          <OrganizationalNavItems />
        </Drawer>
      </MuiThemeProvider>
    )
  }
}


export default withStyles(styles)(NavDrawer)
