import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment'

// MUI
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import Button from 'material-ui/Button';

const Role = (props) => {
  switch(props.role) {
    case 'admin':
      return <span>Administrator</span>
    case 'developer':
      return <span>Developer</span>
    case 'analyst':
      return <span>Analyst</span>
    case 'viewer':
      return <span>View Only</span>
    default:
      return <span>{props.role}</span>
  }
}

const MembershipRow = (props) => {
  const { membership, deleteMembership, openEditMembershipModal } = props

  return (
    <TableRow key={membership.id}>
      <TableCell>
        {membership.email}
      </TableCell>
      <TableCell>
        <Role role={membership.role} />
      </TableCell>
      <TableCell> {moment(membership.joined_at).format('LL')} </TableCell>
      <TableCell>
        <Button
          onClick={() => openEditMembershipModal(membership)}
          variant="raised"
          size="small"
          style={{marginRight: 16}}
        >
          Edit
        </Button>

        <Button onClick={deleteMembership} variant="raised" color="secondary" size="small">
          Remove
        </Button>
      </TableCell>
    </TableRow>
  )
}

const InvitationRow = (props) => {
  const { invitation, deleteInvitation } = props

  return (
    <TableRow key={invitation.id}>
      <TableCell>
        {invitation.email}
      </TableCell>
      <TableCell>
        <Role role={invitation.role} />
      </TableCell>
      <TableCell>
        <span>Invitation Sent</span>
      </TableCell>
      <TableCell>
        <Button onClick={deleteInvitation} variant="raised" color="secondary" size="small">
          Remove
        </Button>
      </TableCell>
    </TableRow>
  )
}


class MembersTable extends Component {

  render() {
    const {
      memberships, invitations, deleteInvitation, deleteMembership,
      openEditMembershipModal
    } = this.props

    return(
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Joined</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {memberships.map(membership =>
            <MembershipRow
              key={membership.id}
              membership={membership}
              deleteMembership={() => deleteMembership(membership)}
              openEditMembershipModal={openEditMembershipModal}
            />
          )}
          {invitations.map(invitation =>
            <InvitationRow
              key={invitation.id}
              invitation={invitation}
              deleteInvitation={() => deleteInvitation(invitation)}
            />
          )}
        </TableBody>
      </Table>
    )
  }
}

export default MembersTable
