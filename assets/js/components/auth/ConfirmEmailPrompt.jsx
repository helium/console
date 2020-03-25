import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../common/AuthLayout'
import { Typography, Card, Row, Col, Button } from 'antd';
import Logo from '../../../img/symbol.svg'
import { primaryBlue } from '../../util/colors'
const { Text, Title } = Typography

class ConfirmEmailPrompt extends Component {

  render() {
    return (
      <AuthLayout>
        <Card style={{padding: 30, borderRadius: 20, boxShadow: '0 52px 64px -50px #001529'}}>
          <img src={Logo} style={{width: 70, display: "block", margin:'0 auto', marginBottom: 20}} />
          <div style={{textAlign: 'center', marginBottom: 30}}>
            <Title>
              Helium Console
            </Title>
            <Text style={{color:primaryBlue}}>Registration Successful</Text>
          </div>
          <Text>
            Please check your inbox for a confirmation email
          </Text>
          <Row gutter={16} style={{marginTop: 20, display: 'flex', justifyContent: 'center' }}>
            <Col sm={12}>
            <Button onClick={() => this.props.history.push('/login')} style={{width: '100%'}}>
              Go to Login
            </Button>
            </Col>
          </Row>
        </Card>
      </AuthLayout>
    )
  }
}

export default ConfirmEmailPrompt
