import React, { Component } from 'react'

// MUI
import Typography from 'material-ui/Typography';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';

class GroupsControl extends Component {
  constructor(props) {
    super(props)

    this.state = {
      groups: props.groups
    }
  }

  render() {
    const { groups } = this.state

    return (
      <form style={{display: 'flex'}}>
          <TextField
            label="Groups"
            value={groups.join(", ")}
            helperText="comma seperated"
            style={{width: '100%'}}
          />

        <div style={{marginTop: 16, marginLeft: 16}}>
          <Button>Save</Button>
        </div>
      </form>
    )
  }
}

export default GroupsControl
