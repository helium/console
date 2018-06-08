import React, { Component } from 'react'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { deleteInvitation } from '../../actions/invitation'
import { deleteMembership, updateMembership } from '../../actions/membership'
import DashboardLayout from '../common/DashboardLayout'
import MembersTable from './MembersTable'
import InvitationsTable from './InvitationsTable'
import NewUserModal from './NewUserModal'
import EditMembershipModal from './EditMembershipModal'
import userCan from '../../util/abilities'
import AuditTable from '../audit_trails/AuditTable'

// GraphQL
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

// MUI
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import { withStyles } from '@material-ui/core/styles'

// Icons
import AddIcon from '@material-ui/icons/Add';

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

const queryOptions = {
  options: props => ({
    variables: {
      page: 1,
      pageSize: 10
    }
  })
}

const query = gql`
  query PaginatedMembershipsQuery ($page: Int, $pageSize: Int) {
    memberships(page: $page, pageSize: $pageSize) {
      entries {
        id,
        email,
        role,
        inserted_at
      },
      totalEntries,
      totalPages,
      pageSize,
      pageNumber
    },
    invitations(page: $page, pageSize: $pageSize) {
      entries {
        id,
        email,
        role,
        inserted_at
      },
      totalEntries,
      totalPages,
      pageSize,
      pageNumber
    }
  }
`

@withStyles(styles)
@connect(null, mapDispatchToProps)
@graphql(query, queryOptions)
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
    const { deleteInvitation, deleteMembership, updateMembership } = this.props

    const { classes } = this.props
    const { memberships, invitations, loading } = this.props.data
    if (this.props.data.loading) return <DashboardLayout title="Team Access" />

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
            memberships={memberships.entries}
            deleteMembership={deleteMembership}
            openEditMembershipModal={this.openEditMembershipModal}
          />
        </Paper>

        <Paper className={classes.paper}>
          <header className={classes.header}>
            <Typography variant="headline" component="h3">
              Invitations
            </Typography>
          </header>

          <InvitationsTable
            invitations={invitations.entries}
            deleteInvitation={deleteInvitation}
          />
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

    if (userCan("view", "auditTrails")) {
      return (
        <DashboardLayout title="Team Access" tabs={tabs} />
      )
    } else {
      return (
        <DashboardLayout title="Team Access">
          {accessView}
        </DashboardLayout>
      )
    }
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    deleteInvitation, deleteMembership, updateMembership
  }, dispatch);
}

export default TeamShow
