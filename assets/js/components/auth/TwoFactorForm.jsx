import React, { Component } from 'react';
import AuthLayout from '../common/AuthLayout'
import Logo from '../../../img/symbol.svg'
import { Typography, Button, Input, Form, Card, Icon, Row, Col } from 'antd';
const { Text, Title } = Typography

class TwoFactorForm extends Component {
  constructor(props) {
    super(props)

    this.state = {
      twoFactorCode: ""
    };

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleInputUpdate = this.handleInputUpdate.bind(this)
  }

  handleSubmit(e) {
    e.preventDefault()

    this.props.onSubmit(this.state.twoFactorCode)
  }

  handleInputUpdate(e) {
    this.setState({ twoFactorCode: e.target.value})
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
            <Text style={{color:'#38A2FF'}}>Enter Two Factor Code</Text>
          </div>

          <Form onSubmit={this.handleSubmit}>
            <Form.Item>
              <Input
                name="twoFactorCode"
                value={this.state.twoFactorCode}
                onChange={this.handleInputUpdate}
                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
              />
            </Form.Item>

            <Row gutter={16} style={{marginTop: 20}}>
              <Col sm={12}>
                <Button type="primary" htmlType="submit" style={{width: '100%'}}>
                  Confirm
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>
      </AuthLayout>
    )
  }
}

export default TwoFactorForm
