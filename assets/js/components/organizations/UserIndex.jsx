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
import { PlusOutlined } from '@ant-design/icons'
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
        extra={
          <UserCan noManager>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => {
                analyticsLogger.logEvent("ACTION_CREATE_NEW_MEMBERSHIP")
                this.openNewUserModal()
              }}
            >
              Add User
            </Button>
          </UserCan>
        }
      >
        <p className="page-description">
          Console users can be added to organizations and have different roles which dictate their access. <a href="https://developer.helium.com/console/users" target="_blank"> Tell me more about users.</a>
        </p>
        <Card
          title="Members"
          bodyStyle={{padding:'0', paddingTop: 1, paddingBottom: 0, overflowX: 'scroll' }}
        >
          <MembersTable
            openEditMembershipModal={this.openEditMembershipModal}
            openDeleteUserModal={this.openDeleteUserModal}
            user={user}
          />
        </Card>

        <Card title="Invites" bodyStyle={{padding:'0', paddingTop: 0, paddingBottom: 0, overflowX: 'scroll' }}>
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
