import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { register } from './actions/auth.js';
import { clearError } from './actions/errors.js'

class Register extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
      passwordConfirm: "",
      error: null
    };

    this.handleInputUpdate = this.handleInputUpdate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleSubmit(e) {
    e.preventDefault();
    const { email, password, passwordConfirm } = this.state;

    this.props.register(email, password, passwordConfirm);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.error !== null) {
      this.setState({ error: nextProps.error })
      this.props.clearError()
    }
  }

  render() {
    return(
      <div>
        <h2>Register</h2>
        {this.renderError()}
        <form onSubmit={this.handleSubmit} noValidate>
          <label>Email</label>
          <input type="email" name="email" value={this.state.email} onChange={this.handleInputUpdate} />
          <label>Password</label>
          <input type="password" name="password" value={this.state.password} onChange={this.handleInputUpdate} />
          <label>Confirm Password</label>
          <input type="password" name="passwordConfirm" value={this.state.passwordConfirm} onChange={this.handleInputUpdate} />
          <button type="submit">Register</button>
        </form>
        <Link to="/secret">Secret!</Link>
      </div>
    );
  }

  renderError() {
    if (this.state.error !== null) return (
      <p>{this.state.error}</p>
    )
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    error: state.errors.registration
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ register, clearError }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Register);
