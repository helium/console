import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { register, hasResetCaptcha } from '../../actions/auth.js';
import config from '../../config/common.js';
import Recaptcha from 'react-recaptcha';

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
    return(
      <div>
        <h2>Register</h2>
        <form onSubmit={this.handleSubmit} noValidate>
          <div>
            <label>Team Name</label>
            <input type="text" name="teamName" value={this.state.teamName} onChange={this.handleInputUpdate} />
          </div>
          <div>
            <label>Email</label>
            <input type="email" name="email" value={this.state.email} onChange={this.handleInputUpdate} />
          </div>
          <div>
            <label>Password</label>
            <input type="password" name="password" value={this.state.password} onChange={this.handleInputUpdate} />
          </div>
          <div>
            <label>Confirm Password</label>
            <input type="password" name="passwordConfirm" value={this.state.passwordConfirm} onChange={this.handleInputUpdate} />
          </div>
          <Recaptcha ref={e => this.recaptchaInstance = e} sitekey={config.recaptcha.sitekey} verifyCallback={this.verifyRecaptcha}/>
          <button type="submit">Register</button>
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
  return bindActionCreators({ register, hasResetCaptcha }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Register);
