import React from 'react';
import AuthLayout from '../common/AuthLayout'
import { Typography, Card, Row, Col, Button } from 'antd';
import Logo from '../../../img/symbol.svg'
import { primaryBlue } from '../../util/colors'
const { Text, Title } = Typography

const ConfirmEmailPrompt = () => {
    return (
      <AuthLayout>
        <Card style={{padding: 30, paddingTop: 20, borderRadius: 20, boxShadow: '0 52px 64px -50px #001529'}}>
          <img src={Logo} style={{width: 70, display: "block", margin:'0 auto', marginBottom: 20}} />
          <div style={{textAlign: 'center', marginBottom: 40}}>
            <Title>
              Helium Console
            </Title>
            <Text style={{color:primaryBlue, fontSize: 18, fontWeight: 300}}>Registration Successful</Text>
            <Text style={{display: 'block'}}>
              Please check your inbox for a confirmation email.
            </Text>
            <Text style={{display: 'block'}}>
              Once you have verified your email address, click below to continue.
            </Text>
          </div>
         
          <Row gutter={16} style={{marginTop: 20, display: 'flex', justifyContent: 'center' }}>
            <Col sm={12}>
            <Button type="primary" onClick={() => window.location.reload()} style={{width: '100%'}}>
              Continue
            </Button>
            </Col>
          </Row>
        </Card>
      </AuthLayout>
    )
}

export default ConfirmEmailPrompt;