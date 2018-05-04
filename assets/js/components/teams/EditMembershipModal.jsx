import React, { Component } from 'react'
import RoleControl from './RoleControl'

// MUI
import Typography from 'material-ui/Typography'
import Modal from 'material-ui/Modal'
import Button from 'material-ui/Button'
import Paper from 'material-ui/Paper'
import TextField from 'material-ui/TextField'
import { withStyles } from 'material-ui/styles'

const styles = theme => ({
  paper: {
    margin: 'auto',
    padding: theme.spacing.unit * 4,
    width: 700,
  },
  input: {
    marginBottom: theme.spacing.unit * 2,
  },
  table: {
    marginTop: theme.spacing.unit * 2
  },
  actions: {
    textAlign: "right"
  },
  formButton: {
    marginTop: theme.spacing.unit * 2
  },
})

class EditMembershipModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      role: ""
    }

    this.handleInputUpdate = this.handleInputUpdate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { membership } = this.props

    if (membership !== prevProps.membership) {
      this.setState({ role: membership.role })
    }
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleSubmit(e) {
    e.preventDefault();

    const { membership, updateMembership, onClose } = this.props
    const { role } = this.state;

    updateMembership( membership.id, role );

    this.setState({ role: '' })

    onClose()
  }

  render() {
    const { open, onClose, classes, membership } = this.props

    if (membership === null) return <div />

    return (
      <Modal
        open={open}
        onClose={onClose}
      >
        <Paper className={classes.paper}>
          <Typography variant="title">
            Edit user
          </Typography>

          <Typography variant="subheading" style={{marginTop: 16}}>
            Select a new role for {membership.email}
          </Typography>

          <form onSubmit={this.handleSubmit}>
            <RoleControl
              value={this.state.role}
              onChange={this.handleInputUpdate}
              classes={classes}
            />

            <div className={classes.actions}>
              <Button
                type="submit"
                variant="raised"
                color="primary"
                size="large"
                className={classes.formButton}
              >
                Update User
              </Button>
            </div>
          </form>
        </Paper>
      </Modal>
    )
  }
}

export default withStyles(styles)(EditMembershipModal)
