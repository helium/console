import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class ConfirmEmailPrompt extends Component {
  render() {
    return(
      <div>
        <h2>Registration Successful</h2>
        <p>Please check your inbox for a confirmation email</p>
        <Link to="/">Home</Link>
      </div>
    );
  }
}

export default ConfirmEmailPrompt;

