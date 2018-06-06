import React, { Component } from 'react'
import DashboardLayout from '../common/DashboardLayout'

// MUI
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';

// Icons
import ReportsIcon from '@material-ui/icons/TrackChanges';

class Reports extends Component {
  render() {
    return (
      <DashboardLayout title="Reports">
        <Paper style={{textAlign: 'center', padding: '5em'}}>
          <ReportsIcon style={{width: 80, height: 80, color: "#e0e0e0"}} />
          <Typography variant="display1" style={{color: "#e0e0e0"}}>
            Reports goes here
          </Typography>
        </Paper>
      </DashboardLayout>
    )
  }
}

export default Reports
