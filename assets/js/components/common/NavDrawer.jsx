import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux';

// MUI
import Drawer from 'material-ui/Drawer';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Divider from 'material-ui/Divider';
import List from 'material-ui/List';
import { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import { withStyles } from 'material-ui/styles';


// Icons
import DevicesIcon from 'material-ui-icons/Memory';
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
  renderHardwareItems() {
    return (
      <div>
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
      </div>
    )
  }

  renderOrganizationalItems() {
    return (
      <div>
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
        {this.renderAuditTrails()}
      </div>
    )
  }

  renderAuditTrails() {
    if (this.props.isAdmin) {
      return (
        <ListItem button component={Link} to="/audit">
          <ListItemIcon>
            <ReportsIcon />
          </ListItemIcon>
          <ListItemText primary="Audit Trails" />
        </ListItem>
      )
    }
  }

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
          <List>{this.renderHardwareItems()}</List>
          <Divider />
          <List>{this.renderOrganizationalItems()}</List>
        </Drawer>
      </MuiThemeProvider>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    isAdmin: state.user.role == "admin"
  }
}

const styled = withStyles(styles)(NavDrawer)
export default connect(mapStateToProps, null)(styled)
