import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import RandomNotificationButton from '../notifications/RandomNotificationButton'
import Logo from '../../../img/logo-horizontalwhite.svg'
import { connect } from 'react-redux';

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
    {
      props.displayDashboard && (
        <ListItem button component={Link} to="/dashboard">
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
      )
    }

    <ListItem button component={Link} to="/devices">
      <ListItemIcon>
        <DevicesIcon />
      </ListItemIcon>
      <ListItemText primary="Devices" />
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

    <ListItem button component={Link} to="/billing">
      <ListItemIcon>
        <BillingIcon />
      </ListItemIcon>
      <ListItemText primary="Data Credits" />
    </ListItem>

    {
      false && <ListItem button component={Link} to="/reports">
        <ListItemIcon>
          <ReportsIcon />
        </ListItemIcon>
        <ListItemText primary="Reports" />
      </ListItem>
    }
  </List>
)

@withStyles(styles)
@connect(mapStateToProps, null)
class NavDrawer extends Component {
  render() {
    const { classes, displayDashboard } = this.props
    // const drawerPaper = Object.assign({}, classes.drawerPaper, {backgroundColor: '#ff0000'})

    return (
      <MuiThemeProvider theme={theme}>
        <Drawer
          variant="permanent"
          classes={{ paper: classes.drawerPaper }}
        >
          <Toolbar style={{minHeight: 48}}>
            <Link to="/" className={classes.logo}>
              <img src={Logo} style={{width: "45%"}} />
            </Link>
          </Toolbar>
          <Divider />
          <HardwareNavItems displayDashboard={displayDashboard} />
          <Divider />
          <OrganizationalNavItems />
          <Divider />
          <div style={{ margin: 24 }}>
            <Typography style={{ marginBottom: 12 }}>Please note that this is a beta version of Helium Console.</Typography>
            <Typography>This website is still undergoing final testing before its official release.</Typography>
          </div>
        </Drawer>
      </MuiThemeProvider>
    )
  }
}

function mapStateToProps(state) {
  return {
    displayDashboard: state.auth.currentOrganizationId
  }
}

export default NavDrawer
