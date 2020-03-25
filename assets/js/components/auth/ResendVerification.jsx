import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { resendVerification } from '../../actions/auth.js';
import AuthLayout from '../common/AuthLayout'
import Logo from '../../../img/symbol.svg'
import { primaryBlue } from '../../util/colors'
import analyticsLogger from '../../util/analyticsLogger'
import { Typography, Button, Input, Form, Card, Icon, Row, Col } from 'antd';
const { Text, Title } = Typography

@connect(mapStateToProps, mapDispatchToProps)
class ResendVerification extends Component {
  state = {
    email: "",
  }

  handleInputUpdate = (e) => {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { email } = this.state;
    analyticsLogger.logEvent("ACTION_RESEND_VERIFICATION", { "email": email })

    this.props.resendVerification(email);
  }

  render() {
    const { classes } = this.props

    return(
      <AuthLayout>
        <Card style={{padding: 30, borderRadius: 20, boxShadow: '0 52px 64px -50px #001529'}}>
          <img src={Logo} style={{width: 70, display: "block", margin:'0 auto', marginBottom: 20}} />

          <div style={{textAlign: 'center', marginBottom: 30}}>
            <Title>
              Helium Console
            </Title>
            <Text style={{color:primaryBlue}}>Resend My Verification Email</Text>
          </div>

          <Form onSubmit={this.handleSubmit}>
            <Form.Item>
              <Input
                placeholder="Email"
                name="email"
                value={this.state.email}
                onChange={this.handleInputUpdate}
                prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />}
              />
            </Form.Item>

            <Row gutter={16} style={{marginTop: 20}}>
              <Col sm={12}>
              <Button type="primary" htmlType="submit" style={{width: '100%'}}>
                Send Email
              </Button>
              </Col>
              <Col sm={12}>
              <Button onClick={() => this.props.history.push('/login')} style={{width: '100%'}}>
                Back to Login
              </Button>
              </Col>
            </Row>
          </Form>
        </Card>
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
