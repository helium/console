import React, { Component } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createTeam } from '../../actions/team'

// MUI
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  paper: {
    margin: 'auto',
    padding: theme.spacing.unit * 2,
    minWidth: 420,
  },
  input: {
    marginBottom: theme.spacing.unit * 2,
  },
})

class NewTeamModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: ""
    }

    this.handleInputUpdate = this.handleInputUpdate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleSubmit(e) {
    e.preventDefault();
    const { name } = this.state;

    this.props.createTeam(name);

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
            New Team
          </Typography>

          <Typography variant="subheading">
            Create a new team
          </Typography>

          <form onSubmit={this.handleSubmit}>
            <TextField
              label="New Team Name"
              name="name"
              value={this.state.name}
              onChange={this.handleInputUpdate}
              className={classes.input}
              fullWidth
            />

            <Button
              type="submit"
              variant="raised"
              color="primary"
              size="large"
              className={classes.formButton}
            >
              Create Team
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
  return bindActionCreators({ createTeam }, dispatch)
}

const styled = withStyles(styles)(NewTeamModal)
export default connect(mapStateToProps, mapDispatchToProps)(styled);
