import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { checkCredentials, hasResetCaptcha, verify2fa } from '../../actions/auth';
import config from '../../config/common';
import Recaptcha from './Recaptcha';
import TwoFactorForm from './TwoFactorForm'
import AuthLayout from '../common/AuthLayout'

// MUI
import TextField from 'material-ui/TextField';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Card, { CardActions, CardContent } from 'material-ui/Card';
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

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
      recaptcha: "",
      loginPage: "login"
    };

    this.handleInputUpdate = this.handleInputUpdate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleTwoFactorSubmit = this.handleTwoFactorSubmit.bind(this);
    this.verifyRecaptcha = this.verifyRecaptcha.bind(this);
    this.renderForm = this.renderForm.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.auth.shouldResetCaptcha) {
      this.recaptchaInstance.reset()
      this.props.hasResetCaptcha()
    }

    if (this.props.auth.user !== prevProps.auth.user && this.props.auth.user.twoFactorEnabled) {
      this.setState({ loginPage: "2fa" })
    }
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleSubmit(e) {
    e.preventDefault();
    const { email, password, recaptcha } = this.state;

    this.props.checkCredentials(email, password, recaptcha);
  }

  verifyRecaptcha(recaptcha) {
    this.setState({ recaptcha })
  }

  handleTwoFactorSubmit(code) {
    const { user } = this.props.auth
    this.props.verify2fa(code, user.id)
  }

  renderForm(classes) {
    if (this.state.loginPage === "2fa") {
      return (
        <TwoFactorForm onSubmit={this.handleTwoFactorSubmit}/>
      )
    } else {
      return (
        <form onSubmit={this.handleSubmit}>
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

          <Typography component="p" className={classes.forgot}>
            <Link to="/forgot_password">Forgot password?</Link>
          </Typography>

          <Recaptcha
            ref={e => this.recaptchaInstance = e}
            sitekey={config.recaptcha.sitekey}
            verifyCallback={this.verifyRecaptcha}
            style={{marginTop: 24}}
          />


        <div>
          <Button
            type="submit"
            variant="raised"
            color="primary"
            size="large"
            className={classes.formButton}
          >
            Sign In
          </Button>

          <Button
            size="large"
            className={classes.formButton}
            style={{marginLeft: 16}}
            component={Link}
            to="/register"
          >
            Register
          </Button>
        </div>
        </form>
      )
    }
  }

  render() {
    const { classes } = this.props
    return(
      <AuthLayout>
        <Card>
          <CardContent>
            <Typography variant="headline" className={classes.title}>
              Sign in
            </Typography>
            {this.renderForm(classes)}
          </CardContent>
        </Card>

        <Typography component="p" className={classes.extraLinks}>
          <Link to="/resend_verification">
            Resend verification email
          </Link>
        </Typography>
      </AuthLayout>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ checkCredentials, hasResetCaptcha, verify2fa }, dispatch);
}

const styled = withStyles(styles)(Login)
export default connect(mapStateToProps, mapDispatchToProps)(styled)
