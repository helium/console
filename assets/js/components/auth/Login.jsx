import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { logIn, checkCredentials, hasResetCaptcha, verify2fa, enable2fa } from '../../actions/auth.js';
import config from '../../config/common.js';
import Recaptcha from 'react-recaptcha';
import TwoFactorForm from './TwoFactorForm.jsx'

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
      recaptcha: "",
      twoFactorCode: "",
      loginPage: "login"
    };

    this.handleInputUpdate = this.handleInputUpdate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleTwoFactorSubmit = this.handleTwoFactorSubmit.bind(this);
    this.skipTwoFactor = this.skipTwoFactor.bind(this);
    this.verifyRecaptcha = this.verifyRecaptcha.bind(this);
    this.renderForm = this.renderForm.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.auth.shouldResetCaptcha) {
      this.recaptchaInstance.reset()
      this.props.hasResetCaptcha()
    }

    if (this.props.auth.user !== nextProps.auth.user) {
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
    user.twoFactorEnabled ? this.props.verify2fa(code, user.id) : this.props.enable2fa(code, user.id, user.secret2fa)
  }

  skipTwoFactor() {
    this.props.logIn(this.props.auth.apikey);
  }

  renderForm() {
    const { user } = this.props.auth
    if (this.state.loginPage === "2fa") {
      const secret2fa = user.secret2fa ? "otpauth://totp/BEAMCoin?secret=" + user.secret2fa + "&issuer=Helium%20Inc" : null
      return (
        <TwoFactorForm twoFactorEnabled={user.twoFactorEnabled} secret2fa={secret2fa} onSubmit={this.handleTwoFactorSubmit} onSkip={this.skipTwoFactor}/>
      )
    } else {
      return (
        <form onSubmit={this.handleSubmit}>
          <label>Email</label>
          <input type="email" name ="email" value={this.state.email} onChange={this.handleInputUpdate} />
          <label>Password</label>
          <input type="password" name="password" value={this.state.password} onChange={this.handleInputUpdate} />
          <Recaptcha ref={e => this.recaptchaInstance = e} sitekey={config.recaptcha.sitekey} verifyCallback={this.verifyRecaptcha}/>
          <button type="submit">Sign In</button>
        </form>
      )
    }
  }

  render() {
    return(
      <div>
        <h2>Sign in</h2>
        {this.renderForm()}
        <Link to="/secret"><p>Secret Page</p></Link>
        <Link to="/register"><p>Register Page</p></Link>
        <Link to="/forgot_password"><p>Forgot Password</p></Link>
        <Link to="/resend_verification"><p>Resend Verification</p></Link>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ checkCredentials, hasResetCaptcha, logIn, verify2fa, enable2fa }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
