import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { changePassword } from './actions/auth.js';

class ResetPassword extends Component {
  constructor(props) {
    super(props);

    this.state = {
      password: "",
      passwordConfirm: ""
    };

    this.handleInputUpdate = this.handleInputUpdate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleSubmit(e) {
    e.preventDefault();
    const { password, passwordConfirm } = this.state;
    const token = this.props.match.params.token

    this.props.changePassword(password, passwordConfirm, token);
  }
  render() {
    return(
      <div>
        <h2>Reset your password</h2>
        <form onSubmit={this.handleSubmit}>
          <label>New Password</label>
          <input type="password" name ="password" value={this.state.password} onChange={this.handleInputUpdate} />
          <label>Confirm Password</label>
          <input type="password" name ="passwordConfirm" value={this.state.passwordConfirm} onChange={this.handleInputUpdate} />
          <button type="submit">Reset Password</button>
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
  return bindActionCreators({ changePassword }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ResetPassword);
