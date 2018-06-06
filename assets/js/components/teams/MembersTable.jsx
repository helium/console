import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment'
import random from 'lodash/random'
import userCan from '../../util/abilities'

// MUI
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';
import SmallChip from '../common/SmallChip'

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
            <TableCell>Last Login</TableCell>
            <TableCell>Two Factor</TableCell>
            <TableCell></TableCell>
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

      <TableCell>
        {moment(membership.joined_at).format('LL')}
      </TableCell>

      <TableCell>
        {moment([2018, random(0, 4), random(1, 28)]).fromNow()}
      </TableCell>

      <TableCell>
        <SmallChip label="Enabled" />
      </TableCell>

      <TableCell numeric>
        {userCan('update', 'membership', membership) &&
          <Button
            onClick={() => openEditMembershipModal(membership)}
            size="small"
          >
            Edit
          </Button>
        }

        {userCan('delete', 'membership', membership) &&
          <Button
            color="secondary"
            onClick={deleteMembership}
            size="small"
          >
            Remove
          </Button>
        }
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
      <TableCell> </TableCell>
      <TableCell numeric>
        <Button
          onClick={deleteInvitation}
          color="secondary"
          size="small"
        >
          Remove
        </Button>
      </TableCell>
    </TableRow>
  )
}

export default MembersTable
