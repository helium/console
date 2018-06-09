import React, { Component } from 'react'
import { Link } from 'react-router-dom'

// MUI
import Portal from '@material-ui/core/Portal';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography'
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import ListSubheader from '@material-ui/core/ListSubheader'
import Avatar from '@material-ui/core/Avatar';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';

// Icons
import DevicesIcon from '@material-ui/icons/Memory';
import GatewaysIcon from '@material-ui/icons/Router';
import ChannelsIcon from '@material-ui/icons/CompareArrows';
import AccessIcon from '@material-ui/icons/People';
import BillingIcon from '@material-ui/icons/CreditCard';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ReportsIcon from '@material-ui/icons/TrackChanges';
import KeyboardReturnIcon from '@material-ui/icons/KeyboardReturn';
import AccountCircle from '@material-ui/icons/AccountCircle'
import MapIcon from '@material-ui/icons/MyLocation'
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ActiveIcon from '@material-ui/icons/FiberManualRecord';

class NotificationsMenu extends Component {
  render() {
    const { anchorEl, open, onClose, notifications } = this.props

    return (
      <Menu {...this.props}>
        <ListSubheader>Notifications</ListSubheader>
        {notifications.length > 0 ?
          <NotificationsList notifications={notifications} />
          :
          <NoNotifications />
        }
        <Divider light style={{marginTop: 4, marginBottom: 4}} />
        <MenuItem component={Link} to="/notifications">
          View all notifications
        </MenuItem>
      </Menu>
    )
  }
}

const NotificationsList = (props) => (
  <div>
    {props.notifications.map(notification =>
      <MenuItem key={notification.id} component={Link} to={notification.url}>
        <ListItemIcon>
          <ActiveIcon style={{fontSize: "14px", color: "#f50057"}} />
        </ListItemIcon>
        <ListItemIcon>
          <NotificationIcon category={notification.category} />
        </ListItemIcon>
        <ListItemText primary={notification.title} secondary={notification.body} />
        <div>
          <Typography component="small" color="textSecondary" style={{fontSize: "0.6rem", height: "34px"}}>
            just now
          </Typography>
        </div>
      </MenuItem>
    )}
  </div>
)

const NoNotifications = (props) => (
  <ListItem>
    <Avatar>
      <ThumbUpIcon />
    </Avatar>
    <ListItemText secondary="No new notifications" />
  </ListItem>
)

const NotificationIcon = (props) => {
  switch (props.category) {
    case "devices":
      return <DevicesIcon style={{color: '#616161'}} />
    case "gateways":
      return <GatewaysIcon style={{color: '#616161'}} />
    case "channels":
      return <ChannelsIcon style={{color: '#616161'}} />
    case "access":
      return <AccessIcon style={{color: '#616161'}} />
    case "dashboard":
      return <DashboardIcon style={{color: '#616161'}} />
    case "profile":
      return <AccountCircle style={{color: '#616161'}} />
    case "map":
      return <MapIcon style={{color: '#616161'}} />
    case "billing":
      return <BillingIcon style={{color: '#616161'}} />
    case "reports":
      return <ReportsIcon style={{color: '#616161'}} />
    default:
      return <DevicesIcon style={{color: '#616161'}} />
  }
}

export default NotificationsMenu
