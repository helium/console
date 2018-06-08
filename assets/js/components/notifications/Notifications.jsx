import React, { Component } from 'react'
import NotificationsMenu from './NotificationsMenu'

// MUI
import IconButton from '@material-ui/core/IconButton'
import SmallBadge from '../common/SmallBadge'

// Icons
import NotificationsIcon from '@material-ui/icons/Notifications'

const initialNotifications = [
  {
    id: "123",
    title: "Gateway Pending Confirmation",
    body: "Confirm your gateways",
    category: "gateways",
    createdAt: 1528487101,
    url: "/gateways",
  },
  {
    id: "123",
    title: "Gateway Pending Confirmation",
    body: "Confirm your gateways",
    category: "gateways",
    createdAt: 1528487101,
    url: "/gateways",
  }
]

class Notifications extends Component {
  constructor(props) {
    super(props)

    this.state = {
      notifications: initialNotifications,
      anchorEl: null
    }

    this.handleClick = this.handleClick.bind(this)
    this.handleClose = this.handleClose.bind(this)
  }

  handleClose() {
    this.setState({
      anchorEl: null
    })
  }

  handleClick(e) {
    this.setState({
      anchorEl: e.currentTarget
    })
  }

  render() {
    const { notifications, anchorEl } = this.state

    return (
      <div>
        <IconButton onClick={this.handleClick} color="inherit">
          {notifications.length > 0 ?
            <SmallBadge badgeContent={notifications.length} color="secondary">
              <NotificationsIcon />
            </SmallBadge>
            :
            <NotificationsIcon />
          }
        </IconButton>

        <NotificationsMenu
          notifications={notifications}
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={this.handleClose}
        />
      </div>
    )
  }
}

export default Notifications
