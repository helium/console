import React, { Component } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createOrganization } from '../../actions/organization';
import { logOut } from '../../actions/auth';
import AuthLayout from '../common/AuthLayout';
import Logo from '../../../img/symbol.svg';
import { primaryBlue } from '../../util/colors';
import { Card, Input, Button, Typography, Row, Col, Form } from 'antd';
const { Text, Title } = Typography

@connect(null, mapDispatchToProps)
class NoOrganization extends Component {
  state = {
    name: "",
  }

  handleInputUpdate = (e) => {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { name } = this.state;

    this.props.createOrganization(name, true)
  }

  render() {
    return (
      <AuthLayout noSideNav>
        <Card style={{padding: 30, paddingTop: 20, borderRadius: 20, boxShadow: '0 52px 64px -50px #001529'}}>
          <img src={Logo} style={{width: 70, display: "block", margin:'0 auto', marginBottom: 20}} />
          <div style={{textAlign: 'center', marginBottom: 40}}>
            <Title>
              Helium Console
            </Title>
            <Text style={{color:primaryBlue, fontSize: 18, fontWeight: 300}}>Create Your First Organization</Text>
          </div>
          <Text style={{display: 'block'}}>
              Define an Organization as the top level of your structure, (usually your company name). This Organization name is used when inviting other users to your Console.
          </Text>
          <div style={{textAlign: 'center'}}>
            <Input
              placeholder="New Organization Name"
              name="name"
              value={this.state.name}
              onChange={this.handleInputUpdate}
              style={{ marginTop: 20 }}
            />
          </div>
          <Form onSubmit={this.handleSubmit}>
            <Row gutter={16} style={{marginTop: 20, display: 'flex', justifyContent: 'center' }}>
              <Col sm={12}>
                <Button onClick={() => this.props.logOut()} style={{width: '100%'}}>
                  Logout
                </Button>
              </Col>
              <Col sm={12}>
              <Button type="primary" onClick={this.handleSubmit} style={{width: '100%'}}>
                Create Organization
              </Button>
              </Col>
            </Row>
          </Form>
          
        </Card>
      </AuthLayout>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createOrganization, logOut }, dispatch)
}

export default NoOrganization
