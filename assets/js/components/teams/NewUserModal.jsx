import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { inviteUser } from '../../actions/team'
import RoleControl from './RoleControl'

// MUI
import Typography from 'material-ui/Typography'
import Modal from 'material-ui/Modal'
import Button from 'material-ui/Button'
import Paper from 'material-ui/Paper'
import TextField from 'material-ui/TextField'
import Input from 'material-ui/Input'
import { withStyles } from 'material-ui/styles'

const styles = theme => ({
  paper: {
    margin: 'auto',
    padding: theme.spacing.unit * 4,
    width: 700,
  },
  input: {
    marginBottom: theme.spacing.unit * 2,
    marginTop: theme.spacing.unit * 2,
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

class NewUserModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      role: "viewer"
    }

    this.handleInputUpdate = this.handleInputUpdate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleSubmit(e) {
    e.preventDefault();
    const { email, role } = this.state;

    this.props.inviteUser({ email, role });

    this.setState({ email: '' })

    this.props.onClose()
  }

  render() {
    const { open, onClose, classes } = this.props

    return (
      <Modal
        open={open}
        onClose={onClose}
      >
        <Paper className={classes.paper}>
          <Typography variant="title">
            Invite new user
          </Typography>

          <Typography variant="subheading" style={{marginTop: 16}}>
            Enter the email address of the user you'd like to invite, and choose the role they should have.
          </Typography>

          <form onSubmit={this.handleSubmit}>
            <TextField
              label="Email"
              name="email"
              value={this.state.email}
              onChange={this.handleInputUpdate}
              className={classes.input}
              placeholder="alice@example.com"
              autoFocus
              fullWidth
            />

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
                Invite User
              </Button>
            </div>
          </form>
        </Paper>
      </Modal>
    )
  }
}

function mapStateToProps(state) {
  return {
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ inviteUser }, dispatch)
}

const styled = withStyles(styles)(NewUserModal)
export default connect(mapStateToProps, mapDispatchToProps)(styled);
