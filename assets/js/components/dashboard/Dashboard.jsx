import React, { Component } from 'react'
import DashboardLayout from '../common/DashboardLayout'
import OrganizationsTable from '../teams/OrganizationsTable'
import OrganizationTeamsTable from '../teams/OrganizationTeamsTable'
import NewTeamModal from '../teams/NewTeamModal'
import NewOrganizationModal from '../teams/NewOrganizationModal'
import analyticsLogger from '../../util/analyticsLogger'

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
      showOrganizationModal: false,
      organizationId: null,
      organizationName: "",
    }
    this.openTeamModal = this.openTeamModal.bind(this)
    this.closeTeamModal = this.closeTeamModal.bind(this)
    this.openOrganizationModal = this.openOrganizationModal.bind(this)
    this.closeOrganizationModal = this.closeOrganizationModal.bind(this)
  }

  componentDidMount() {
    analyticsLogger.logEvent("ACTION_NAV_DASHBOARD")
  }

  openTeamModal(organizationId, organizationName) {
    this.setState({ showTeamModal: true, organizationId, organizationName })
  }

  openOrganizationModal() {
    this.setState({ showOrganizationModal: true })
  }

  closeTeamModal() {
    this.setState({ showTeamModal: false, organizationId: null, organizationName: "" })
  }

  closeOrganizationModal() {
    this.setState({ showOrganizationModal: false })
  }

  render() {
    const { classes } = this.props
    const { showTeamModal, showOrganizationModal, organizationName, organizationId } = this.state
    return (
      <DashboardLayout title="Dashboard">
        <Paper className={classes.paper}>
          <OrganizationsTable openOrganizationModal={this.openOrganizationModal} />
        </Paper>

        <Paper className={classes.paper}>
          <OrganizationTeamsTable openTeamModal={this.openTeamModal} />
        </Paper>

        <NewTeamModal
          open={showTeamModal}
          organizationName={organizationName}
          organizationId={organizationId}
          onClose={this.closeTeamModal}
        />

        <NewOrganizationModal
          open={showOrganizationModal}
          onClose={this.closeOrganizationModal}
        />
      </DashboardLayout>
    )
  }
}

export default Dashboard
