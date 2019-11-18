import React, { Component } from 'react'

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

const ConsoleIcon = (props) => {
  switch (props.category) {
    case "devices":
      return <DevicesIcon style={{color: '#616161'}} />
    case "gateways":
      return <GatewaysIcon style={{color: '#616161'}} />
    case "channels":
      return <ChannelsIcon style={{color: '#616161'}} />
    case "users":
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

export default ConsoleIcon
