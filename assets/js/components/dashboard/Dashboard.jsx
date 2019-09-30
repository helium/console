import React, { Component } from 'react'
import DashboardLayout from '../common/DashboardLayout'
import OrganizationsTable from '../teams/OrganizationsTable'
import NewTeamModal from '../teams/NewTeamModal'

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
  constructor(props) {
    super(props)
    this.state = {
      showTeamModal: false,
      organizationId: null,
      organizationName: "",
    }
    this.openTeamModal = this.openTeamModal.bind(this)
    this.closeTeamModal = this.closeTeamModal.bind(this)
  }

  openTeamModal(organizationId, organizationName) {
    this.setState({ showTeamModal: true, organizationId, organizationName })
  }

  closeTeamModal() {
    this.setState({ showTeamModal: false, organizationId: null, organizationName: "" })
  }

  render() {
    const { classes } = this.props
    const { showTeamModal, organizationName, organizationId } = this.state
    return (
      <DashboardLayout title="Dashboard">
        <Paper className={classes.paper}>
          <OrganizationsTable openTeamModal={this.openTeamModal} />
        </Paper>

        <NewTeamModal
          open={showTeamModal}
          organizationName={organizationName}
          organizationId={organizationId}
          onClose={this.closeTeamModal}
        />
      </DashboardLayout>
    )
  }
}

export default Dashboard
