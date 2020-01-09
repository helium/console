import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { checkCredentials, verify2fa } from '../../actions/auth';
import TwoFactorForm from './TwoFactorForm'
import AuthLayout from '../common/AuthLayout'
import Logo from '../../../img/logo-horizontal.svg'
import analyticsLogger from '../../util/analyticsLogger'
import { Typography, Button, Input, Form } from 'antd';
const { Text } = Typography

@withRouter
@connect(mapStateToProps, mapDispatchToProps)
class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
      loginPage: "login"
    };

    this.handleInputUpdate = this.handleInputUpdate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleTwoFactorSubmit = this.handleTwoFactorSubmit.bind(this);
    this.loginForm = this.loginForm.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.auth.user !== prevProps.auth.user && this.props.auth.user.twoFactorEnabled) {
      this.setState({ loginPage: "2fa" })
    }
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleSubmit(e) {
    e.preventDefault();
    const { email, password } = this.state;
    analyticsLogger.logEvent("ACTION_LOGIN", { "email": email })
    this.props.checkCredentials(email, password);
  }

  handleTwoFactorSubmit(code) {
    const { user } = this.props.auth
    this.props.verify2fa(code, user.id)
  }

  loginForm() {
    return (
      <AuthLayout>
        <img src={Logo} style={{width: 150, margin: "auto", display: "block"}} />

        <Text strong>
          Sign in
        </Text>

        <Form onSubmit={this.handleSubmit}>
          <Form.Item>
            <Input
              placeholder="Email"
              type="email"
              name="email"
              value={this.state.email}
              onChange={this.handleInputUpdate}
            />
          </Form.Item>

          <Form.Item>
            <Input
              placeholder="Password"
              type="password"
              name="password"
              value={this.state.password}
              onChange={this.handleInputUpdate}
            />
          </Form.Item>

          <Text>
            <Link to="/forgot_password">Forgot password?</Link>
          </Text>

          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button type="primary" htmlType="submit">
              Log in
            </Button>

            <Button onClick={() => this.props.history.push('/register')}>
              Register
            </Button>
          </div>

          <Text>
            <Link to="/resend_verification">Resend verification email</Link>
          </Text>
        </Form>
      </AuthLayout>
    )
  }

  render() {
    if (this.state.loginPage === "2fa") {
      return (
        <TwoFactorForm onSubmit={this.handleTwoFactorSubmit}/>
      )
    } else {
      return(this.loginForm())
    }
  }

}

function mapStateToProps(state) {
  return {
    auth: state.auth
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ checkCredentials, verify2fa }, dispatch);
}

export default Login
