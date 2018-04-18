import React, { Component } from 'react'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import pick from 'lodash/pick'
import { fetchTeam } from '../../actions/team'
import DashboardLayout from '../common/DashboardLayout'
import MembersTable from './MembersTable'
import NewUserModal from './NewUserModal'

// MUI
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Card, { CardActions, CardContent } from 'material-ui/Card';

// Icons
import AddIcon from 'material-ui-icons/Add';

class TeamShow extends Component {
  constructor(props) {
    super(props)

    this.state = {
      newUserOpen: false
    }

    this.openNewUserModal = this.openNewUserModal.bind(this)
    this.closeNewUserModal = this.closeNewUserModal.bind(this)
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

  render() {
    const { memberships, invitations } = this.props

    return (
      <DashboardLayout title="Team Access">
        <Card>
          <CardContent>

            <MembersTable memberships={memberships} invitations={invitations} />

          </CardContent>
          <CardActions>
            <Button variant="raised" size="small" onClick={this.openNewUserModal}>
              <AddIcon style={{marginRight: 4}} />
              New User
            </Button>
          </CardActions>
        </Card>

        <NewUserModal
          open={this.state.newUserOpen}
          onClose={this.closeNewUserModal}
        />
      </DashboardLayout>
    )
  }
}

function mapStateToProps(state, ownProps) {
  const currentTeamId = state.auth.currentTeamId
  const team = state.entities.teams[currentTeamId]
  let memberships = []
  if (team !== undefined && team.memberships !== undefined) {
    memberships = Object.values(state.entities.memberships, team.memberships)
  }

  let invitations = []
  if (team !== undefined && team.invitations !== undefined) {
    invitations = Object.values(state.entities.invitations, team.invitations)
    invitations = invitations.filter(invitation => invitation.pending)
  }

  return {
    currentTeamId,
    memberships,
    invitations
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchTeam }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(TeamShow);
