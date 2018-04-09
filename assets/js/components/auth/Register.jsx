import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { register, hasResetCaptcha } from '../../actions/auth.js';
import config from '../../config/common.js';
import Recaptcha from './Recaptcha.jsx';
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
  formButton: {
    marginTop: theme.spacing.unit * 2,
  },
  extraLinks: {
    marginTop: theme.spacing.unit * 2,
    textAlign: 'center'
  }
});

class Register extends Component {
  constructor(props) {
    super(props);

    this.state = {
      teamName: "",
      email: "",
      password: "",
      passwordConfirm: "",
      recaptcha: ""
    };

    this.handleInputUpdate = this.handleInputUpdate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.verifyRecaptcha = this.verifyRecaptcha.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.auth.shouldResetCaptcha) {
      this.recaptchaInstance.reset()
      this.props.hasResetCaptcha()
    }
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleSubmit(e) {
    e.preventDefault();
    const { teamName, email, password, passwordConfirm, recaptcha} = this.state;

    // if (password === passwordConfirm) {
      this.props.register(teamName, email, password, passwordConfirm, recaptcha);
    // } else {
      // window.alert("passwords do not match, please try again")
    // }
  }

  verifyRecaptcha(recaptcha) {
    this.setState({ recaptcha })
  }

  render() {
    const { classes } = this.props

    return(
      <AuthLayout>
        <Card>
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
                fullWidth
              />

              <TextField
                type="email"
                label="Email"
                name="email"
                value={this.state.email}
                onChange={this.handleInputUpdate}
                fullWidth
              />

              <TextField
                type="password"
                label="Password"
                name="password"
                value={this.state.password}
                onChange={this.handleInputUpdate}
                fullWidth
              />

              <TextField
                type="password"
                label="Confirm Password"
                name="passwordConfirm"
                value={this.state.passwordConfirm}
                onChange={this.handleInputUpdate}
                fullWidth
                style={{marginBottom: 16}}
              />

              <Recaptcha
                ref={e => this.recaptchaInstance = e}
                sitekey={config.recaptcha.sitekey}
                verifyCallback={this.verifyRecaptcha}
              />

              <Button
                type="submit"
                variant="raised"
                color="primary"
                size="large"
                className={classes.formButton}
              >
                Register
              </Button>

              <Button
                size="large"
                className={classes.formButton}
                style={{marginLeft: 16}}
                component={Link}
                to="/login"
              >
                Log in
              </Button>

            </form>
          </CardContent>
        </Card>
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
  return bindActionCreators({ register, hasResetCaptcha }, dispatch);
}

const styled = withStyles(styles)(Register)
export default connect(mapStateToProps, mapDispatchToProps)(styled);
