import React, { Component } from 'react'
import DashboardLayout from '../common/DashboardLayout'

// MUI
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';

// Icons
import NotificationsIcon from '@material-ui/icons/Notifications';

class Notifications extends Component {
  render() {
    return (
      <DashboardLayout title="All Notifications">
        <Paper style={{textAlign: 'center', padding: '5em'}}>
          <NotificationsIcon style={{width: 80, height: 80, color: "#e0e0e0"}} />
          <Typography variant="display1" style={{color: "#e0e0e0"}}>
            Notifications goes here
          </Typography>
        </Paper>
      </DashboardLayout>
    )
  }
}

export default Notifications
