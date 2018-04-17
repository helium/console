import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment'

// MUI
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import Button from 'material-ui/Button';

const Role = (props) => {
  switch(props.role) {
    case 'owner':
      return <span>Administrator (Owner)</span>
    case 'viewer':
      return <span>Viewer (Read-Only)</span>
    default:
      return <span>{props.role}</span>
  }
}


class MembersTable extends Component {

  render() {
    const { members } = this.props

    return(
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Joined</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {members.map(member => {
            return (
              <TableRow key={member.id}>
                <TableCell> {member.email} </TableCell>
                <TableCell>
                  <Role role={member.role} />
                </TableCell>
                <TableCell> {moment(member.joined_at).format('LL')} </TableCell>
                <TableCell>
                  <Button variant="raised" size="small" style={{marginRight: 16}}>
                    Edit
                  </Button>

                  <Button variant="raised" color="secondary" size="small">
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    )
  }
}

export default MembersTable
