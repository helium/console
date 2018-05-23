import React, { Component } from 'react'
import DashboardLayout from '../common/DashboardLayout'

// MUI
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';

// Icons
import DashboardIcon from '@material-ui/icons/Dashboard';

class Dashboard extends Component {
  render() {
    return (
      <DashboardLayout title="Dashboard">
        <Paper style={{textAlign: 'center', padding: '5em'}}>
          <DashboardIcon style={{width: 80, height: 80, color: "#e0e0e0"}} />
          <Typography variant="display1" style={{color: "#e0e0e0"}}>
            Dashboard goes here
          </Typography>
        </Paper>
      </DashboardLayout>
    )
  }
}

export default Dashboard
