import React from 'react';
import { Link } from 'react-router-dom';

const ConfirmEmailPrompt = () => (
  <div>
    <h2>Registration Successful</h2>
    <p>Please check your inbox for a confirmation email</p>
    <p><strong>In Development:</strong> Visit <a href="/sent_emails">/sent_emails</a> to see the email</p>
    <Link to="/">Home</Link>
  </div>
)

export default ConfirmEmailPrompt;
