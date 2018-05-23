import React, { Component } from 'react'

// MUI
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';

// Icons
import InfoOutlineIcon from '@material-ui/icons/InfoOutline'

const roles = [
  {
    value: "admin",
    name: "Administrator",
    description: "Best for business owners and company administrators"
  },
  {
    value: "developer",
    name: "Developer",
    description: "Best for developers or people primarily using the API"
  },
  {
    value: "analyst",
    name: "Analyst",
    description: "Best for people who need full access to data and billing settings but don't need to update business settings"
  },
  {
    value: "viewer",
    name: "View Only",
    description: "Best for people who need to view data, but don't need to make any updates"
  },
]

const RoleControl = (props) => {
  const { classes, value, onChange } = props

  return (
    <Table className={classes.table}>
      <TableBody>
        {roles.map(role => (
          <TableRow key={role.value}>
            <TableCell padding="checkbox">
              <Radio
                checked={value === role.value}
                onChange={onChange}
                value={role.value}
                name="role"
              />
            </TableCell>
            <TableCell nowrap="true">{role.name}</TableCell>
            <TableCell>{role.description}</TableCell>
            <TableCell padding="checkbox" style={{color: '#90A4AE'}}>
              <InfoOutlineIcon />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default RoleControl
