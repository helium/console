import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { checkCredentials, verify2fa } from '../../actions/auth';
import TwoFactorForm from './TwoFactorForm'
import AuthLayout from '../common/AuthLayout'
import Logo from '../../../img/logo-horizontal.svg'

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
class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
      loginPage: "login"
    };

    this.handleInputUpdate = this.handleInputUpdate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleTwoFactorSubmit = this.handleTwoFactorSubmit.bind(this);
    this.loginForm = this.loginForm.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.auth.user !== prevProps.auth.user && this.props.auth.user.twoFactorEnabled) {
      this.setState({ loginPage: "2fa" })
    }
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleSubmit(e) {
    e.preventDefault();
    const { email, password } = this.state;
    console.log("ACTION_LOGIN", email)
    this.props.checkCredentials(email, password);
  }

  handleTwoFactorSubmit(code) {
    const { user } = this.props.auth
    this.props.verify2fa(code, user.id)
  }

  loginForm(classes) {
    return (
      <AuthLayout>
        <img src={Logo} style={{width: "33%", margin: "0 auto 20px", display: "block"}} />
        <Card>
          <CardContent>
            <Typography variant="headline" className={classes.title}>
              Sign in
            </Typography>

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
          </CardContent>
        </Card>

        <Typography component="p" className={classes.extraLinks}>
          <Link to="/resend_verification">
            Resend verification email
          </Link>
        </Typography>
      </AuthLayout>
    )
  }

  render() {
    const { classes } = this.props
    if (this.state.loginPage === "2fa") {
      return (
        <TwoFactorForm onSubmit={this.handleTwoFactorSubmit}/>
      )
    } else {
      return(this.loginForm(classes))
    }
  }

}

function mapStateToProps(state) {
  return {
    auth: state.auth
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ checkCredentials, verify2fa }, dispatch);
}

export default Login
