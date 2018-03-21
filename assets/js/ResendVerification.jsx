import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { resendVerification, clearCaptchaStatus } from './actions/auth.js';
import Recaptcha from 'react-recaptcha';

class ResendVerification extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
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
    const { email, recaptcha } = this.state;

    this.props.resendVerification(email, recaptcha);
  }

  verifyRecaptcha(recaptcha) {
    this.setState({ recaptcha })
  }

  render() {
    return(
      <div>
        <h2>Resend My Verification Email</h2>
        <form onSubmit={this.handleSubmit}>
          <label>Email</label>
          <input type="email" name ="email" value={this.state.email} onChange={this.handleInputUpdate} />
          <Recaptcha ref={e => this.recaptchaInstance = e} sitekey="6Lew200UAAAAACN3_-tS_UvTcnhF2mlZCzzQ4Na5" verifyCallback={this.verifyRecaptcha}/>
          <button type="submit">Send Email</button>
        </form>
        <Link to="/login"><p>Login Page</p></Link>
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
  return bindActionCreators({ resendVerification, clearCaptchaStatus }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ResendVerification);
