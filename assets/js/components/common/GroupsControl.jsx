import React, { Component } from 'react'

// MUI
import Typography from 'material-ui/Typography';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';

class GroupsControl extends Component {
  constructor(props) {
    super(props)

    const groups = props.groups === undefined ? [] : props.groups

    this.state = {
      groups: groups.join(", ")
    }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleInputUpdate = this.handleInputUpdate.bind(this)
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleSubmit(e) {
    e.preventDefault()

    this.props.handleUpdate(this.state.groups)
  }

  render() {
    const { groups } = this.state

    return (
      <form style={{display: 'flex'}} onSubmit={this.handleSubmit} autoComplete="off">
          <TextField
            label="Groups"
            name="groups"
            value={groups}
            helperText="comma seperated"
            onChange={this.handleInputUpdate}
            style={{width: '100%'}}
          />

        <div style={{marginTop: 16, marginLeft: 16}}>
          <Button type="submit">Save</Button>
        </div>
      </form>
    )
  }
}

export default GroupsControl
