import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { logIn, hasResetCaptcha } from '../../actions/auth.js';
import config from '../../config/common.js';
import Recaptcha from 'react-recaptcha';

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
      recaptcha: "",
      twoFactorCode: ""
    };

    this.handleInputUpdate = this.handleInputUpdate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleTwoFactorSubmit = this.handleTwoFactorSubmit.bind(this);
    this.verifyRecaptcha = this.verifyRecaptcha.bind(this);
    this.renderForm = this.renderForm.bind(this);
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
    const { email, password, recaptcha } = this.state;

    this.props.logIn(email, password, recaptcha);
  }

  handleTwoFactorSubmit(e) {
    e.preventDefault();
    const { twoFactorCode } = this.state;

    // this.props.checkCredentials(email, password, recaptcha);
    console.log(twoFactorCode)
  }

  verifyRecaptcha(recaptcha) {
    this.setState({ recaptcha })
  }

  renderForm() {
    // if (this.props.auth.validCredentials) {
    //   return (
    //     <form onSubmit={this.handleTwoFactorSubmit}>
    //       <label>2FA Code</label>
    //       <input type="twoFactorCode" name ="twoFactorCode" value={this.state.twoFactorCode} onChange={this.handleInputUpdate} />
    //       <button type="submit">Submit</button>
    //     </form>
    //   )
    // } else {
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
    // }
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
  return bindActionCreators({ logIn, hasResetCaptcha }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
