import React, { Component } from 'react'
import DashboardLayout from '../common/DashboardLayout'

// MUI
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';

// Icons
import BillingIcon from '@material-ui/icons/CreditCard';

class Billing extends Component {
  render() {
    return (
      <DashboardLayout title="Billing">
        <Paper style={{textAlign: 'center', padding: '5em'}}>
          <BillingIcon style={{width: 80, height: 80, color: "#e0e0e0"}} />
          <Typography variant="display1" style={{color: "#e0e0e0"}}>
            Billing goes here
          </Typography>
        </Paper>
      </DashboardLayout>
    )
  }
}

export default Billing
