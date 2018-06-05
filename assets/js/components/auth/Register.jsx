import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { parse } from 'query-string'
import { register, hasResetCaptcha } from '../../actions/auth.js';
import config from '../../config/common.js';
import Recaptcha from './Recaptcha.jsx';
import TermsPrompt from './TermsPrompt.jsx'
import AuthLayout from '../common/AuthLayout'
import DocumentLayout from '../common/DocumentLayout'
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
  formButton: {
    marginTop: theme.spacing.unit * 2,
  },
  extraLinks: {
    marginTop: theme.spacing.unit * 2,
    textAlign: 'center'
  },
});

@withStyles(styles)
@connect(mapStateToProps, mapDispatchToProps)
class Register extends Component {
  constructor(props) {
    super(props);

    this.state = {
      teamName: "",
      email: "",
      password: "",
      passwordConfirm: "",
      recaptcha: "",
      showTerms: false
    };

    this.handleInputUpdate = this.handleInputUpdate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.registerUser = this.registerUser.bind(this);
    this.verifyRecaptcha = this.verifyRecaptcha.bind(this);

    this.registerContent = this.registerContent.bind(this)
    this.joinContent = this.joinContent.bind(this)
    this.commonFields = this.commonFields.bind(this)
  }

  componentDidUpdate(prevProps) {
    if (this.props.auth.shouldResetCaptcha) {
      this.setState({ showTerms: false }, () => {
        this.recaptchaInstance.reset()
        this.props.hasResetCaptcha()
      })
    }
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleSubmit(e) {
    e.preventDefault();
    this.setState({ showTerms: true })
  }

  registerUser(e) {
    e.preventDefault();
    const { teamName, email, password, passwordConfirm, recaptcha } = this.state;
    const { register, invitationToken } = this.props
    register(
      teamName,
      email,
      password,
      passwordConfirm,
      recaptcha,
      invitationToken
    );
  }

  verifyRecaptcha(recaptcha) {
    this.setState({ recaptcha })
  }

  registerContent() {
    const { classes } = this.props
    return (
      <CardContent>
        <Typography variant="headline" className={classes.title}>
          Register
        </Typography>

        <form onSubmit={this.handleSubmit} noValidate>
          <TextField
            label="Team Name"
            name="teamName"
            value={this.state.teamName}
            onChange={this.handleInputUpdate}
            className={classes.input}
            fullWidth
          />

          {this.commonFields()}

          <Button
            type="submit"
            variant="raised"
            color="primary"
            size="large"
            fullWidth
            className={classes.formButton}
          >
            Register
          </Button>


          <Button
            size="large"
            className={classes.formButton}
            component={Link}
            fullWidth
            to="/login"
          >
            Log In
          </Button>

        </form>
      </CardContent>
    )
  }

  joinContent() {
    const { classes, teamName, inviter } = this.props

    return (
      <CardContent>
        <Typography variant="headline">
          Join {teamName}
        </Typography>

        <Typography variant="subheading" className={classes.title}>
          Invited by {inviter}
        </Typography>

        <form onSubmit={this.handleSubmit} noValidate>
          {this.commonFields()}

          <Button
            type="submit"
            variant="raised"
            color="primary"
            size="large"
            fullWidth
            className={classes.formButton}
          >
            Join Team
          </Button>
        </form>
      </CardContent>
    )
  }

  commonFields() {
    const { classes } = this.props
    return (
      <div>
        <TextField
          type="email"
          label="Email"
          name="email"
          value={this.state.email}
          onChange={this.handleInputUpdate}
          className={classes.input}
          fullWidth
        />

        <TextField
          type="password"
          label="Password"
          name="password"
          value={this.state.password}
          onChange={this.handleInputUpdate}
          className={classes.input}
          fullWidth
        />

        <TextField
          type="password"
          label="Confirm Password"
          name="passwordConfirm"
          value={this.state.passwordConfirm}
          onChange={this.handleInputUpdate}
          className={classes.input}
          fullWidth
          style={{marginBottom: 16}}
        />

        <Recaptcha
          ref={e => this.recaptchaInstance = e}
          sitekey={config.recaptcha.sitekey}
          verifyCallback={this.verifyRecaptcha}
          style={{marginTop: 24}}
        />
      </div>
    )
  }

  render() {
    const { version } = this.props
    const { showTerms } = this.state

    if (showTerms) {
      return(
        <DocumentLayout>
          <TermsPrompt handleSubmit={this.registerUser}/>
        </DocumentLayout>
      );
    } else {
      return(
        <AuthLayout>
          <Card>
            {version === "register" ? this.registerContent() : this.joinContent()}
          </Card>
        </AuthLayout>
      );
    }
  }
}

function mapStateToProps(state, ownProps) {
  let queryParams = parse(ownProps.location.search)
  if (queryParams.invitation !== undefined) {
    return {
      auth: state.auth,
      version: "join",
      invitationToken: queryParams.invitation,
      teamName: queryParams.team_name,
      inviter: queryParams.inviter
    }
  }

  return {
    auth: state.auth,
    version: "register"
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ register, hasResetCaptcha }, dispatch);
}

export default Register
