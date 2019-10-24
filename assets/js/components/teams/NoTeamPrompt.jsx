import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createOrganization } from '../../actions/team'
import { logOut } from '../../actions/auth'
import AuthLayout from '../common/AuthLayout'

// MUI
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { withStyles } from '@material-ui/core/styles';

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

@withStyles(styles)
@connect(mapStateToProps, mapDispatchToProps)
class NoTeamPrompt extends Component {
  constructor(props) {
    super(props)

    this.state = {
      name: "",
      teamName: "",
    }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleInputUpdate = this.handleInputUpdate.bind(this)
  }

  handleSubmit(e) {
    e.preventDefault()

    this.props.createOrganization(this.state.name, this.state.teamName, true)
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value})
  }

  render() {
    const { classes, logOut } = this.props

    return (
      <AuthLayout>
        <Card>
          <CardContent>
            <Typography variant="headline" className={classes.title}>
              You aren't part of an organization
            </Typography>
            <Typography variant="subheading" className={classes.title}>
              Create a new organization to get started
            </Typography>

            <form onSubmit={this.handleSubmit}>
              <TextField
                label="Organization Name"
                name="name"
                value={this.state.name}
                onChange={this.handleInputUpdate}
                className={classes.input}
                fullWidth
              />
              <TextField
                label="Team Name"
                name="teamName"
                value={this.state.teamName}
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
                Create
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
  return {}
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createOrganization, logOut }, dispatch);
}

export default NoTeamPrompt
