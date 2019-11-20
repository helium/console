import React, { Component } from 'react'
import DashboardLayout from '../common/DashboardLayout'

// MUI
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';

// Icons
import BillingIcon from '@material-ui/icons/CreditCard';

class DataCredits extends Component {
  componentDidMount() {
    console.log("ACTION_NAV_DATA_CREDITS")
  }

  render() {
    return (
      <DashboardLayout title="Data Credits">
        <Paper style={{textAlign: 'center', padding: '5em'}}>
          <BillingIcon style={{width: 80, height: 80, color: "#e0e0e0"}} />
          <Typography variant="subheading" style={{color: "#363636"}}>
            Purchase Data Credits from Helium to send device data.
          </Typography>
          <Typography variant="subheading" style={{color: "#363636"}}>
            The cost per fragment is $0.00001 USD (fragments are 24 bytes) which is equivalent to 1 Data Credit (DC).
          </Typography>
          <Typography variant="subheading" style={{color: "#363636", marginTop: 20 }}>
            During the Beta, the cost to send packets is 0 DC.
          </Typography>
        </Paper>
      </DashboardLayout>
    )
  }
}

export default DataCredits
