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
    padding: theme.spacing.unit * 2,
    width: 420,
  },
  input: {
    marginBottom: theme.spacing.unit * 2,
  },
})

class NewUserModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      role: ""
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

    this.setState({ email: '', role: '' })

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

          <Typography variant="subheading">
            Invite a new user to TEAM
          </Typography>

          <form onSubmit={this.handleSubmit}>
            <TextField
              label="Email"
              name="email"
              value={this.state.email}
              onChange={this.handleInputUpdate}
              className={classes.input}
              fullWidth
            />

            <RoleControl
              value={this.state.role}
              onChange={this.handleInputUpdate}
              classes={classes}
            />


            <Button
              type="submit"
              variant="raised"
              color="primary"
              size="large"
              className={classes.formButton}
            >
              Invite User
            </Button>
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
