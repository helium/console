import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { checkCredentials, verify2fa } from '../../actions/auth';
import { primaryBlue } from '../../util/colors'
import TwoFactorForm from './TwoFactorForm'
import AuthLayout from '../common/AuthLayout'
import Logo from '../../../img/symbol.svg'
import analyticsLogger from '../../util/analyticsLogger'
import { Typography, Button, Input, Form, Icon, Card, Row, Col } from 'antd';
const { Text, Title } = Typography

@withRouter
@connect(mapStateToProps, mapDispatchToProps)
class Login extends Component {
  state = {
    email: "",
    password: "",
    loginPage: "login"
  }

  componentDidUpdate(prevProps) {
    if (this.props.auth.user !== prevProps.auth.user && this.props.auth.user.twoFactorEnabled) {
      this.setState({ loginPage: "2fa" })
    }
  }

  handleInputUpdate = (e) => {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { email, password } = this.state;
    analyticsLogger.logEvent("ACTION_LOGIN", { "email": email })
    this.props.checkCredentials(email, password);
  }

  handleTwoFactorSubmit = (code) => {
    const { user } = this.props.auth
    this.props.verify2fa(code, user.id)
  }

  loginForm = () => {
    return (
      <AuthLayout>
      <Card style={{padding: 30, borderRadius: 20, boxShadow: '0 52px 64px -50px #001529'}}>
      <img src={Logo} style={{width: 70, display: "block", margin:'0 auto', marginBottom: 20}} />
      <div style={{textAlign: 'center', marginBottom: 30}}>
        <Title>
          Helium Console
        </Title>
        <Text style={{color:primaryBlue}}>Please Sign in</Text>
        </div>

        <Form onSubmit={this.handleSubmit}>
          <Form.Item style={{marginBottom: 10}}>
            <Input
              placeholder="Email"
              type="email"
              name="email"
              value={this.state.email}
              onChange={this.handleInputUpdate}
              prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />}
              style={{width: 400}}
            />
          </Form.Item>

          <Form.Item>

            <Input
              prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
              type="password"
              placeholder="Password"
               name="password"
              value={this.state.password}
              onChange={this.handleInputUpdate}
              style={{width: 400}}
            />
        </Form.Item>

                  <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>


          <Text>
            <Link to="/forgot_password">Forgot password?</Link>
          </Text>
          <Text>
            <Link to="/resend_verification">Resend verification email</Link>
          </Text>

          </div>

          <Row gutter={16} style={{marginTop: 20}}>
          <Col sm={12}>
            <Button type="primary" htmlType="submit" style={{width: '100%'}}>
              Log in
            </Button>
            </Col>
            <Col sm={12}>
            <Button onClick={() => this.props.history.push('/register')} style={{width: '100%'}}>
              Register
            </Button>
            </Col>
            </Row>

        </Form>
              </Card>

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
