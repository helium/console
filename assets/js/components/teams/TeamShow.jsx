import React, { Component } from 'react'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { updateMembership } from '../../actions/membership'
import DashboardLayout from '../common/DashboardLayout'
import MembersTable from './MembersTable'
import InvitationsTable from './InvitationsTable'
import NewUserModal from './NewUserModal'
import EditMembershipModal from './EditMembershipModal'
import UserCan from '../common/UserCan'
import analyticsLogger from '../../util/analyticsLogger'
import { Typography, Button } from 'antd';
const { Text } = Typography

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
}

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

  componentDidMount() {
    analyticsLogger.logEvent("ACTION_NAV_ORG_USERS")
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
    const { updateMembership } = this.props

    return (
      <DashboardLayout title="Users">
        <header style={styles.header}>
          <Text style={{ fontWeight: 'bold' }}>Members</Text>
          <UserCan action="create" itemType="membership">
            <Button
              onClick={() => {
                analyticsLogger.logEvent("ACTION_CREATE_NEW_MEMBERSHIP")
                this.openNewUserModal()
              }}
            >
              New Member
            </Button>
          </UserCan>
        </header>

        <MembersTable
          openEditMembershipModal={this.openEditMembershipModal}
        />

        <header style={{ ...styles.header, marginTop: 20 }}>
          <Text style={{ fontWeight: 'bold' }}>Invites</Text>
        </header>

        <InvitationsTable />

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

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    updateMembership
  }, dispatch);
}

export default TeamShow
