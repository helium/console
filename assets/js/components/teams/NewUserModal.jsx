import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { inviteUser } from '../../actions/team'
import RoleControl from './RoleControl'

// MUI
import Typography from '@material-ui/core/Typography'
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Modal from '@material-ui/core/Modal'
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
import Input from '@material-ui/core/Input'
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
  paper: {
    margin: 'auto',
    marginTop: '10%',
    width: '50%',
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

@withStyles(styles)
@connect(mapStateToProps, mapDispatchToProps)
class NewUserModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      organization: "",
      role: "viewer"
    }

    this.handleInputUpdate = this.handleInputUpdate.bind(this);
    this.handleOrganizationUpdate = this.handleOrganizationUpdate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleOrganizationUpdate(e) {
    this.setState({ organization: e.target.value })
  }

  handleSubmit(e) {
    e.preventDefault();
    const { email, role, organization } = this.state;

    this.props.inviteUser({ email, role, organization });

    this.setState({ email: '', organization: '' })

    this.props.onClose()
  }

  render() {
    const { open, onClose, classes, teams, organization } = this.props

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
            <FormControl>
              <InputLabel htmlFor="select">Invite to Organization</InputLabel>
              <Select
                value={this.state.organization}
                onChange={this.handleOrganizationUpdate}
                inputProps={{
                  name: 'organization',
                }}
                style={{ width: 200 }}
              >
                <MenuItem value={organization.id} key={organization.id}>{organization.name}</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Email"
              name="email"
              value={this.state.email}
              onChange={this.handleInputUpdate}
              className={classes.input}
              placeholder="alice@example.com"
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
    teams: Object.values(state.entities.teams),
    organization: {
      id: state.auth.currentOrganizationId,
      name: state.auth.currentOrganizationName,
    }
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ inviteUser }, dispatch)
}

export default NewUserModal
