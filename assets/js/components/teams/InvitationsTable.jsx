import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment'
import userCan from '../../util/abilities'

// MUI
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';

class InvitationsTable extends Component {
  render() {
    const { invitations, deleteInvitation } = this.props

    return(
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Sent At</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
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
        {moment(invitation.joined_at).format('LL')}
      </TableCell>
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

export default InvitationsTable
