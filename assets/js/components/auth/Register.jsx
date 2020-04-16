import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { parse } from 'query-string'
import { register } from '../../actions/auth.js';
import { getInvitation } from '../../actions/invitation.js';
import { primaryBlue } from '../../util/colors'
import AuthLayout from '../common/AuthLayout'
import Logo from '../../../img/symbol.svg'
import analyticsLogger from '../../util/analyticsLogger'
import { Typography, Button, Input, Form, Checkbox, Card, Row, Col, Icon } from 'antd';
const { Text, Title } = Typography

@connect(mapStateToProps, mapDispatchToProps)
class Register extends Component {
  state = {
    organizationName: "",
    email: "",
    password: "",
    showOrgCreation: false,
    acceptedTerms: false,
  }

  componentDidMount() {
    const { invitationToken, getInvitation } = this.props
    if (invitationToken) {
      getInvitation(invitationToken)
      .then(invite => this.setState({ email: invite.email, invite }))
    }
  }

  handleInputUpdate = (e) => {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleSubmit = (e) => {
    e.preventDefault();
    if (this.state.acceptedTerms) this.setState({ showOrgCreation: true })
  }

  registerUser = (e) => {
    e.preventDefault()
    const { email, password, organizationName } = this.state;
    const { register, invitationToken } = this.props
    analyticsLogger.logEvent("ACTION_REGISTER", { "email": email })
    register(
      organizationName,
      email,
      password,
      invitationToken
    );
  }

  registerContent = () => {
    const { classes } = this.props
    const { showOrgCreation, acceptedTerms } = this.state
    return (
      <div>
        <Card style={{padding: 30, paddingTop:20, borderRadius: 20, boxShadow: '0 52px 64px -50px #001529'}}>
      <img src={Logo} style={{width: 70, display: "block", margin:'0 auto', marginBottom: 20}} />
      <div style={{textAlign: 'center', marginBottom: 30}}>
        <Title>
          Register for <br />Helium Console
        </Title>
        <Text style={{color:primaryBlue, fontSize: 18, fontWeight: 300}}>Create your account below</Text>
        </div>
        {
          showOrgCreation ? (
            <Form onSubmit={this.registerUser}>
              <Text>
                Define an Organization as the top level of your structure, (usually your company name).  This Organization name is used when inviting other users to your Console.
              </Text>
 

              <Form.Item>
                <Input
                  placeholder="Organization Name"
                  name="organizationName"
                  value={this.state.organizationName}
                  onChange={this.handleInputUpdate}
                  style={{marginTop: 20}}
                />
              </Form.Item>

              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Button onClick={() => this.setState({ showOrgCreation: false })} style={{width: '100%'}}>
                  Back
                </Button>
                <Button style={{marginRight: 0, width: '100%'}} type="primary" htmlType="submit">
                  Continue
                </Button>
              </div>
            </Form>
          ) : (
            <Form onSubmit={this.handleSubmit}>
              {this.commonFields()}


              <Row gutter={16} style={{marginTop:10}}>
          
            <Col sm={12}>
            <Button onClick={() => this.props.history.push('/login')} style={{width: '100%'}}>
              Go to Login
            </Button>
            </Col>
            <Col sm={12}>
            <Button type="primary" htmlType="submit" style={{width: '100%',}} disabled={!acceptedTerms}>
              Register
            </Button>
            </Col>
            </Row>

            </Form>
          )
        }
        </Card>
      </div>
    )
  }

  joinContent = () => {
    const { acceptedTerms, invite } = this.state

    return (
      <div>
        <Card style={{padding: 30, borderRadius: 20, boxShadow: '0 52px 64px -50px #001529'}}>
          <img src={Logo} style={{width: 70, display: "block", margin:'0 auto', marginBottom: 20}} />
          <div style={{textAlign: 'center', marginBottom: 30}}>
            <Title>
              Register to join {invite && invite.organizationName}
            </Title>
            <Text style={{color:primaryBlue}}>You are invited by {invite && invite.inviter}</Text>
          </div>
          <Form onSubmit={this.registerUser}>
            {this.commonFields()}

            <Row gutter={16} style={{marginTop:10}}>
              <Col sm={12}>
                <Button type="primary" htmlType="submit" style={{width: '100%'}} disabled={!acceptedTerms}>
                  Register
                </Button>
              </Col>
              <Col sm={12}>
              <Button onClick={() => this.props.history.push('/login')} style={{width: '100%'}}>
                I want to Login
              </Button>
              </Col>
            </Row>
          </Form>
        </Card>
      </div>
    )
  }

  commonFields = () => {
    const { classes } = this.props
    const { acceptedTerms } = this.state
    return (
      <div>

        <Form.Item style={{marginBottom: 10}}>
          <Input
            placeholder="Email"
            type="email"
            name="email"
            value={this.state.email}
            onChange={this.handleInputUpdate}
             prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />}
              style={{width: '100%'}}
          />
        </Form.Item>

        <Form.Item>
          <Input
            placeholder="Password"
            type="password"
            prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
            name="password"
            value={this.state.password}
            onChange={this.handleInputUpdate}
            style={{width:  '100%'}}
          />
        </Form.Item>

        <Checkbox style={{marginBottom: 20}} checked={acceptedTerms} onChange={() => this.setState({ acceptedTerms: !acceptedTerms })}>
          I accept and have read the <Link to="/terms" target="_blank">Helium Privacy Statement</Link>.
        </Checkbox>
      </div>
    )
  }

  render() {
    const { version } = this.props

    return(
      <AuthLayout>
        {version === "register" ? this.registerContent() : this.joinContent()}
      </AuthLayout>
    )
  }
}

function mapStateToProps(state, ownProps) {
  let queryParams = parse(ownProps.location.search)
  if (queryParams.invitation !== undefined) {
    return {
      auth: state.auth,
      version: "join",
      invitationToken: queryParams.invitation,
    }
  }

  return {
    auth: state.auth,
    version: "register"
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ register, getInvitation }, dispatch);
}

export default Register
