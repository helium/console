import React, { Component } from 'react'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { fetchTeam } from '../../actions/team'
import { deleteInvitation } from '../../actions/invitation'
import { deleteMembership, updateMembership } from '../../actions/membership'
import DashboardLayout from '../common/DashboardLayout'
import MembersTable from './MembersTable'
import NewUserModal from './NewUserModal'
import EditMembershipModal from './EditMembershipModal'
import userCan from '../../util/abilities'
import AuditTable from '../audit_trails/AuditTable'

// MUI
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';

// Icons
import AddIcon from '@material-ui/icons/Add';

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

  componentDidMount() {
    const { fetchTeam, currentTeamId } = this.props
    fetchTeam(currentTeamId)
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
    const {
      memberships, invitations, deleteInvitation, deleteMembership,
      updateMembership
    } = this.props

    return (
      <DashboardLayout title="Team Access">
        <Card>
          <CardContent>

            <MembersTable
              memberships={memberships}
              invitations={invitations}
              deleteInvitation={deleteInvitation}
              deleteMembership={deleteMembership}
              openEditMembershipModal={this.openEditMembershipModal}
            />

          </CardContent>
          <CardActions>
            {userCan('create', 'membership') &&
              <Button variant="raised" size="small" onClick={this.openNewUserModal}>
                <AddIcon style={{marginRight: 4}} />
                New User
              </Button>
            }
          </CardActions>
        </Card>

        {
          userCan("view", "auditTrails") &&
          <Card style={{marginTop: 24}}>
            <AuditTable title="Team History"/>
          </Card>
        }

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
      </DashboardLayout>
    )
  }
}

function mapStateToProps(state, ownProps) {
  const currentTeamId = state.auth.currentTeamId
  const team = state.entities.teams[currentTeamId]

  let memberships = []
  if (team !== undefined) {
    memberships = Object
      .values(state.entities.memberships)
  }

  let invitations = []
  if (team !== undefined) {
    invitations = Object
      .values(state.entities.invitations)
      .filter(invitation => invitation.pending)
  }

  return {
    currentTeamId,
    memberships,
    invitations
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    fetchTeam, deleteInvitation, deleteMembership, updateMembership
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(TeamShow);
