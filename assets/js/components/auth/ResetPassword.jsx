import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { changePassword } from '../../actions/auth.js';
import AuthLayout from '../common/AuthLayout'
import Logo from '../../../img/symbol.svg'
import { Typography, Button, Input, Form, Card, Icon, Row, Col } from 'antd';
const { Text, Title } = Typography

@connect(null, mapDispatchToProps)
class ResetPassword extends Component {
  state = {
    password: "",
    passwordConfirm: ""
  }

  handleInputUpdate = (e) => {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { password, passwordConfirm } = this.state;
    const token = this.props.match.params.token

    this.props.changePassword(password, passwordConfirm, token);
  }

  render() {
    return(
      <AuthLayout>
        <Card style={{padding: 30, borderRadius: 20, boxShadow: '0 52px 64px -50px #001529'}}>
          <img src={Logo} style={{width: 70, display: "block", margin:'0 auto', marginBottom: 20}} />
          <div style={{textAlign: 'center', marginBottom: 30}}>
            <Title>
              Helium Console
            </Title>
            <Text style={{color:'#38A2FF'}}>Reset Your Password</Text>
          </div>

          <Form onSubmit={this.handleSubmit}>
            <Form.Item style={{marginBottom: 10}}>
              <Input
                placeholder="New password"
                type="password"
                name="password"
                value={this.state.password}
                onChange={this.handleInputUpdate}
                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
              />
            </Form.Item>

            <Form.Item>
              <Input
                placeholder="Confirm Password"
                type="password"
                name="passwordConfirm"
                value={this.state.passwordConfirm}
                onChange={this.handleInputUpdate}
                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
              />
            </Form.Item>

            <Row gutter={16} style={{marginTop: 20}}>
              <Col sm={12}>
              <Button type="primary" htmlType="submit" style={{width: '100%'}}>
                Submit
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

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ changePassword }, dispatch);
}

export default ResetPassword
