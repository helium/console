import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createTeam } from '../../actions/team'
import { logOut } from '../../actions/auth'
import AuthLayout from '../common/AuthLayout'

// MUI
import TextField from 'material-ui/TextField';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Card, { CardContent } from 'material-ui/Card';
import { withStyles } from 'material-ui/styles';

const styles = theme => ({
  title: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit,
  },
  input: {
    marginBottom: theme.spacing.unit * 2,
  },
  forgot: {
    textAlign: 'right',
    marginBottom: theme.spacing.unit * 2,
  },
  formButton: {
    marginTop: theme.spacing.unit * 2,
  },
  extraLinks: {
    marginTop: theme.spacing.unit * 2,
    textAlign: 'center'
  }
});

class NoTeamPrompt extends Component {
  constructor(props) {
    super(props)

    this.state = {
      name: ""
    }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleInputUpdate = this.handleInputUpdate.bind(this)
  }

  handleSubmit(e) {
    e.preventDefault()

    this.props.createTeam(this.state.name, '/devices')
  }

  handleInputUpdate(e) {
    this.setState({ name: e.target.value})
  }

  render() {
    const { classes, logOut } = this.props

    return (
      <AuthLayout>
        <Card>
          <CardContent>
            <Typography variant="headline" className={classes.title}>
              You don't have any teams
            </Typography>
            <Typography variant="subheading" className={classes.title}>
              Create a new team to get started
            </Typography>

            <form onSubmit={this.handleSubmit}>
              <TextField
                label="Team Name"
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
                fullWidth
                className={classes.formButton}
              >
                Create Team
              </Button>
            </form>
          </CardContent>
        </Card>

        <Typography component="p" className={classes.extraLinks}>
          <a
            href="#"
            onClick={logOut}
          >
            Log out
          </a>
        </Typography>

      </AuthLayout>
    )
  }
}

function mapStateToProps(state) {
  return { }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createTeam, logOut }, dispatch);
}

const styled = withStyles(styles)(NoTeamPrompt)
export default connect(mapStateToProps, mapDispatchToProps)(styled);
