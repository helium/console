import React, { Component } from 'react'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { updateMembership, deleteMembership } from '../../actions/membership'
import { deleteInvitation } from '../../actions/invitation'
import DashboardLayout from '../common/DashboardLayout'
import MembersTable from './MembersTable'
import InvitationsTable from './InvitationsTable'
import NewUserModal from './NewUserModal'
import EditMembershipModal from './EditMembershipModal'
import DeleteUserModal from './DeleteUserModal'
import UserCan from '../common/UserCan'
import analyticsLogger from '../../util/analyticsLogger'
import { Typography, Button, Card } from 'antd';

const { Text } = Typography


const styles = {
  header: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
}

@connect(null, mapDispatchToProps)
class UserIndex extends Component {
  constructor(props) {
    super(props)

    this.state = {
      newUserOpen: false,
      editMembershipOpen: false,
      deleteUserOpen: false,
      editingMembership: null
    }

    this.openNewUserModal = this.openNewUserModal.bind(this)
    this.closeNewUserModal = this.closeNewUserModal.bind(this)
    this.openEditMembershipModal = this.openEditMembershipModal.bind(this)
    this.closeEditMembershipModal = this.closeEditMembershipModal.bind(this)
    this.openDeleteUserModal = this.openDeleteUserModal.bind(this)
    this.closeDeleteUserModal = this.closeDeleteUserModal.bind(this)
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

  openDeleteUserModal(membership, type) {
    this.setState({ deleteUserOpen: true, editingMembership: Object.assign({}, membership, { type }) })
  }

  closeDeleteUserModal() {
    this.setState({deleteUserOpen: false})
  }

  render() {
    const { updateMembership, deleteMembership, deleteInvitation } = this.props

    return (
      <DashboardLayout title="Users">
        <Card title="Members" bodyStyle={{padding:'0', paddingTop: 20, paddingBottom: 0}}>
          <header style={styles.header}>
            <Button
            type="primary"
            icon="plus"
            style={{marginBottom: 20}}
              onClick={() => {
                analyticsLogger.logEvent("ACTION_CREATE_NEW_MEMBERSHIP")
                this.openNewUserModal()
              }}
            >
              Add User
            </Button>
          </header>

          <MembersTable
            openEditMembershipModal={this.openEditMembershipModal}
            openDeleteUserModal={this.openDeleteUserModal}
          />
        </Card>

        <Card title="Invites" bodyStyle={{padding:'0', paddingTop: 0, paddingBottom: 0}}>
          <header style={{ ...styles.header, marginTop: 1 }} />
          <InvitationsTable openDeleteUserModal={this.openDeleteUserModal} />
        </Card>

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

        <DeleteUserModal
          open={this.state.deleteUserOpen}
          onClose={this.closeDeleteUserModal}
          membership={this.state.editingMembership}
          deleteMembership={deleteMembership}
          deleteInvitation={deleteInvitation}
        />
      </DashboardLayout>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    updateMembership, deleteMembership, deleteInvitation
  }, dispatch);
}

export default UserIndex
