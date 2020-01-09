import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../common/AuthLayout'
import { Typography } from 'antd';
const { Text } = Typography

class ConfirmEmailPrompt extends Component {

  render() {
    return (
      <AuthLayout>
        <Text strong>
          Registration Successful
        </Text>
        <br />
        <Text>
          Please check your inbox for a confirmation email
        </Text>
        <br />
        <Text>
          <Link to="/login">Login</Link>
        </Text>
      </AuthLayout>
    )
  }
}

export default ConfirmEmailPrompt
