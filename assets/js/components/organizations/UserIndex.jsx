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
import { Typography, Button } from 'antd';
import PlusOutlined from '@ant-design/icons/PlusOutlined'
const { Text } = Typography

@connect(null, mapDispatchToProps)
class UserIndex extends Component {
  state = {
    newUserOpen: false,
    editMembershipOpen: false,
    deleteUserOpen: false,
    editingMembership: null
  }

  componentDidMount() {
    analyticsLogger.logEvent("ACTION_NAV_ORG_USERS")
  }

  openNewUserModal = () => {
    this.setState({newUserOpen: true})
  }

  closeNewUserModal = () => {
    this.setState({newUserOpen: false})
  }

  openEditMembershipModal = (membership) => {
    this.setState({
      editMembershipOpen: true,
      editingMembership: membership
    })
  }

  closeEditMembershipModal = () => {
    this.setState({editMembershipOpen: false})
  }

  openDeleteUserModal = (membership, type) => {
    this.setState({ deleteUserOpen: true, editingMembership: Object.assign({}, membership, { type }) })
  }

  closeDeleteUserModal = () => {
    this.setState({deleteUserOpen: false})
  }

  render() {
    const { updateMembership, deleteMembership, deleteInvitation, user } = this.props
    return (
      <DashboardLayout
        title="Users"
        user={this.props.user}
        noAddButton
      >
        <div style={{ height: '100%', width: '100%', backgroundColor: '#ffffff', borderRadius: 6, overflow: 'hidden', boxShadow: '0px 20px 20px -7px rgba(17, 24, 31, 0.19)' }}>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: '30px 20px 20px 30px', minWidth: 320 }}>
            <Text style={{ fontSize: 22, fontWeight: 600 }}>All Members</Text>
            <UserCan noManager>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                style={{ borderRadius: 4 }}
                onClick={() => {
                  analyticsLogger.logEvent("ACTION_CREATE_NEW_MEMBERSHIP")
                  this.openNewUserModal()
                }}
              >
                Add User
              </Button>
            </UserCan>
          </div>
          <MembersTable
            openEditMembershipModal={this.openEditMembershipModal}
            openDeleteUserModal={this.openDeleteUserModal}
            user={user}
          />
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: '30px 20px 20px 30px' }}>
            <Text style={{ fontSize: 22, fontWeight: 600 }}>All Invitations</Text>
          </div>
          <InvitationsTable openDeleteUserModal={this.openDeleteUserModal} user={user} />
        </div>

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
