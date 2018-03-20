import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { forgotPassword } from './actions/auth.js';
import Recaptcha from 'react-recaptcha';

class ForgotPassword extends Component {
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

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleSubmit(e) {
    e.preventDefault();
    const { email, recaptcha } = this.state;

    this.props.forgotPassword(email, recaptcha);
  }

  verifyRecaptcha(recaptcha) {
    this.setState({ recaptcha })
  }

  render() {
    return(
      <div>
        <h2>Enter your email</h2>
        <form onSubmit={this.handleSubmit}>
          <label>Email</label>
          <input type="email" name ="email" value={this.state.email} onChange={this.handleInputUpdate} />
          <Recaptcha sitekey="6Lew200UAAAAACN3_-tS_UvTcnhF2mlZCzzQ4Na5" verifyCallback={this.verifyRecaptcha}/>
          <button type="submit">Send Email</button>
        </form>
        <Link to="/login"><p>Login Page</p></Link>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {}
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ forgotPassword }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ForgotPassword);
