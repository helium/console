import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { formatDatetimeAgo } from '../../util/time'

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

// Redux
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import  { markRead } from '../../actions/notifications'

// Icons
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ActiveIcon from '@material-ui/icons/FiberManualRecord';
import ConsoleIcon from '../common/ConsoleIcon'

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ markRead }, dispatch);
}

@connect(null, mapDispatchToProps)
class NotificationsMenu extends Component {
  constructor(props) {
    super(props)
    this.markRead = this.markRead.bind(this)
  }

  markRead(notification) {
    const { markRead } = this.props
    markRead(notification.id, {active: false}, notification.url)
  }

  render() {
    const { anchorEl, open, onClose, notifications } = this.props

    return (
      <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
        <ListSubheader>Recent Notifications</ListSubheader>
        {notifications.length > 0 ?
          <NotificationsList notifications={notifications} markRead={this.markRead} />
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
      <MenuItem key={notification.id} onClick={() => props.markRead(notification)}>
        <ListItemIcon>
          <ActiveIcon style={{fontSize: "14px", color: "#f50057"}} />
        </ListItemIcon>
        <ListItemIcon>
          <ConsoleIcon category={notification.category} />
        </ListItemIcon>
        <ListItemText primary={notification.title} secondary={notification.body} />
        <div>
          <Typography component="small" color="textSecondary" style={{fontSize: "0.6rem", height: "34px"}}>
            {formatDatetimeAgo(notification.insertedAt)}
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

export default NotificationsMenu
