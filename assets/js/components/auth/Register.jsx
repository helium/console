import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { parse } from 'query-string'
import { register } from '../../actions/auth.js';
import AuthLayout from '../common/AuthLayout'
import Logo from '../../../img/symbol.svg'
import analyticsLogger from '../../util/analyticsLogger'
import { Typography, Button, Input, Form, Checkbox, Card, Row, Col, Icon } from 'antd';
const { Text, Title } = Typography

@connect(mapStateToProps, mapDispatchToProps)
class Register extends Component {
  constructor(props) {
    super(props);

    this.state = {
      organizationName: "",
      email: props.email || "",
      password: "",
      showOrgCreation: false,
      acceptedTerms: false,
    };

    this.handleInputUpdate = this.handleInputUpdate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.registerUser = this.registerUser.bind(this);

    this.registerContent = this.registerContent.bind(this)
    this.joinContent = this.joinContent.bind(this)
    this.commonFields = this.commonFields.bind(this)
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleSubmit(e) {
    e.preventDefault();
    if (this.state.acceptedTerms) this.setState({ showOrgCreation: true })
  }

  registerUser(e) {
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

  registerContent() {
    const { classes } = this.props
    const { showOrgCreation, acceptedTerms } = this.state
    return (
      <div>
        <Card style={{padding: 30, borderRadius: 20, boxShadow: '0 52px 64px -50px #001529'}}>
      <img src={Logo} style={{width: 70, display: "block", margin:'0 auto', marginBottom: 20}} />
      <div style={{textAlign: 'center', marginBottom: 30}}>
        <Title>
          Register for <br />Helium Console
        </Title>
        <Text style={{color:'#38A2FF'}}>Create your account below</Text>
        </div>
        {
          showOrgCreation ? (
            <Form onSubmit={this.registerUser}>
              <Text>
                To easily manage devices, Console provides a logical structure with Organizations and Devices. Define an Organization name as the top level of your structure, (usually your company name).
              </Text>
              <br />
              <Text>
                The Organization name is used when inviting other users to your Console.
              </Text>

              <Form.Item>
                <Input
                  placeholder="Organization Name"
                  name="organizationName"
                  value={this.state.organizationName}
                  onChange={this.handleInputUpdate}
                />
              </Form.Item>

              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Button type="primary" htmlType="submit">
                  Register
                </Button>

                <Button onClick={() => this.setState({ showOrgCreation: false })}>
                  Back
                </Button>
              </div>
            </Form>
          ) : (
            <Form onSubmit={this.handleSubmit}>
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
          )
        }
        </Card>
      </div>
    )
  }

  joinContent() {
    const { classes, organizationName, inviter } = this.props
    const { acceptedTerms } = this.state

    return (
      <div>
        <Text strong>
          Register to join {organizationName}
        </Text>
        <br />
        <Text>
          You are invited by {inviter}
        </Text>

        <Form onSubmit={this.registerUser}>
          {this.commonFields()}

          <Button type="primary" htmlType="submit" disabled={!acceptedTerms}>
            Join
          </Button>
        </Form>
      </div>
    )
  }

  commonFields() {
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
              style={{width: 400}}
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
            style={{width: 400}}
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
      organizationName: queryParams.organization_name,
      inviter: queryParams.inviter,
      email: queryParams.email,
    }
  }

  return {
    auth: state.auth,
    version: "register"
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ register }, dispatch);
}

export default Register
