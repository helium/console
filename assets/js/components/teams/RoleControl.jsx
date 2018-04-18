import React, { Component } from 'react'

// MUI
import { FormControl } from 'material-ui/Form'
import Input, { InputLabel } from 'material-ui/Input'
import Select from 'material-ui/Select'
import { MenuItem } from 'material-ui/Menu'

const RoleControl = (props) => {
  const { classes, value, onChange } = props

  return (
    <FormControl className={classes.input} fullWidth>
      <InputLabel htmlFor="role">Role</InputLabel>
      <Select
        value={value}
        onChange={onChange}
        inputProps={{id: 'role', name: 'role'}}
      >
        <MenuItem value="admin">Administrator</MenuItem>
        <MenuItem value="viewer">Read-Only</MenuItem>
      </Select>
    </FormControl>
  )
}

export default RoleControl
