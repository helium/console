import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { forgotPassword } from './actions/auth.js';

class ForgotPassword extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: ""
    };

    this.handleInputUpdate = this.handleInputUpdate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleSubmit(e) {
    e.preventDefault();
    const { email } = this.state;

    this.props.forgotPassword(email);
  }
  render() {
    return(
      <div>
        <h2>Enter your email</h2>
        <form onSubmit={this.handleSubmit}>
          <label>Email</label>
          <input type="email" name ="email" value={this.state.email} onChange={this.handleInputUpdate} />
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
