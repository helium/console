import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { resendVerification } from '../../actions/auth.js';
import AuthLayout from '../common/AuthLayout'
import Logo from '../../../img/logo-horizontal.svg'
import analyticsLogger from '../../util/analyticsLogger'
import { Typography, Button, Input, Form } from 'antd';
const { Text } = Typography

@connect(mapStateToProps, mapDispatchToProps)
class ResendVerification extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
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
    analyticsLogger.logEvent("ACTION_RESEND_VERIFICATION", { "email": email })

    this.props.resendVerification(email);
  }

  render() {
    const { classes } = this.props

    return(
      <AuthLayout>
        <img src={Logo} style={{width: 150, margin: "auto", display: "block"}} />

        <Text strong>
          Resend my verification email
        </Text>

        <Form onSubmit={this.handleSubmit}>
          <Form.Item>
            <Input
              placeholder="Email"
              name="email"
              value={this.state.email}
              onChange={this.handleInputUpdate}
            />
          </Form.Item>

          <div>
            <Button type="primary" htmlType="submit">
              Send Email
            </Button>
          </div>

          <Text>
            <Link to="/login">
               Back to Login
            </Link>
          </Text>
        </Form>
      </AuthLayout>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ resendVerification }, dispatch);
}

export default ResendVerification
