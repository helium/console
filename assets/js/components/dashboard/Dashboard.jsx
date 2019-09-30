import React, { Component } from 'react'
import DashboardLayout from '../common/DashboardLayout'
import OrganizationsTable from '../teams/OrganizationsTable'

// MUI
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles'

// Icons
import DashboardIcon from '@material-ui/icons/Dashboard';

const styles = theme => ({
  paper: {
    padding: theme.spacing.unit * 3,
    paddingTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 3
  },
})

@withStyles(styles)
class Dashboard extends Component {
  render() {
    const { classes } = this.props
    return (
      <DashboardLayout title="Dashboard">
        <Paper className={classes.paper}>
          <OrganizationsTable />
        </Paper>
      </DashboardLayout>
    )
  }
}

export default Dashboard
