import React, { Component } from 'react'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { updateMembership } from '../../actions/membership'
import DashboardLayout from '../common/DashboardLayout'
import MembersTable from './MembersTable'
import InvitationsTable from './InvitationsTable'
import NewUserModal from './NewUserModal'
import EditMembershipModal from './EditMembershipModal'
import userCan from '../../util/abilities'
import AuditTable from '../audit_trails/AuditTable'

// MUI
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
  paper: {
    padding: theme.spacing.unit * 3,
    paddingTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 3
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between'
  },
})

@withStyles(styles)
@connect(null, mapDispatchToProps)
class TeamShow extends Component {
  constructor(props) {
    super(props)

    this.state = {
      newUserOpen: false,
      editMembershipOpen: false,
      editingMembership: null
    }

    this.openNewUserModal = this.openNewUserModal.bind(this)
    this.closeNewUserModal = this.closeNewUserModal.bind(this)
    this.openEditMembershipModal = this.openEditMembershipModal.bind(this)
    this.closeEditMembershipModal = this.closeEditMembershipModal.bind(this)
  }

  openNewUserModal() {
    this.setState({newUserOpen: true})
  }

  closeNewUserModal() {
    this.setState({newUserOpen: false})
  }

  openEditMembershipModal(membership) {
    this.setState({
      editMembershipOpen: true,
      editingMembership: membership
    })
  }

  closeEditMembershipModal() {
    this.setState({editMembershipOpen: false})
  }

  render() {
    const { classes, updateMembership } = this.props

    const accessView = (
      <div>
        <Paper className={classes.paper}>
          <header className={classes.header}>
            <Typography variant="headline" component="h3">
              Members
            </Typography>

            {userCan('create', 'membership') &&
              <Button
                color="primary"
                onClick={this.openNewUserModal}
              >
                New User
              </Button>
            }
          </header>

          <MembersTable
            openEditMembershipModal={this.openEditMembershipModal}
          />
        </Paper>

        <Paper className={classes.paper}>
          <header className={classes.header}>
            <Typography variant="headline" component="h3">
              Invitations
            </Typography>
          </header>

          <InvitationsTable />
        </Paper>

        <NewUserModal
          open={this.state.newUserOpen}
          onClose={this.closeNewUserModal}
        />

        <EditMembershipModal
          open={this.state.editMembershipOpen}
          onClose={this.closeEditMembershipModal}
          membership={this.state.editingMembership}
          updateMembership={updateMembership}
        />
      </div>
    )

    const activityView = (
      <Card>
        <AuditTable title="Team History"/>
      </Card>
    )

    const tabs = [{
      label: "Access View",
      content: accessView,
      path: "/teams/access",
    }, {
      label: "Activity View",
      content: activityView,
      path: "/teams/activity",
    }]

    // if (userCan("view", "auditTrails")) {
      return (
        <DashboardLayout title="Team Access" tabs={tabs} />
      )
    // } else {
    //   return (
    //     <DashboardLayout title="Team Access">
    //       {accessView}
    //     </DashboardLayout>
    //   )
    // }
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    updateMembership
  }, dispatch);
}

export default TeamShow
