import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { logIn, clearCaptchaStatus } from './actions/auth.js';
import Recaptcha from 'react-recaptcha';

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
      recaptcha: ""
    };

    this.handleInputUpdate = this.handleInputUpdate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.verifyRecaptcha = this.verifyRecaptcha.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.auth.resetCaptcha) {
      this.recaptchaInstance.reset()
      this.props.clearCaptchaStatus()
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

  verifyRecaptcha(recaptcha) {
    this.setState({ recaptcha })
  }

  render() {
    return(
      <div>
        <h2>Sign in</h2>
        <form onSubmit={this.handleSubmit}>
          <label>Email</label>
          <input type="email" name ="email" value={this.state.email} onChange={this.handleInputUpdate} />
          <label>Password</label>
          <input type="password" name="password" value={this.state.password} onChange={this.handleInputUpdate} />
          <Recaptcha ref={e => this.recaptchaInstance = e} sitekey="6Lew200UAAAAACN3_-tS_UvTcnhF2mlZCzzQ4Na5" verifyCallback={this.verifyRecaptcha}/>
          <button type="submit">Sign In</button>
        </form>
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
  return bindActionCreators({ logIn, clearCaptchaStatus }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
