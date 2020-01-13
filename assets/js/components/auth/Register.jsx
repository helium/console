import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { parse } from 'query-string'
import { register } from '../../actions/auth.js';
import AuthLayout from '../common/AuthLayout'
import Logo from '../../../img/logo-horizontal.svg'
import analyticsLogger from '../../util/analyticsLogger'
import { Typography, Button, Input, Form, Checkbox } from 'antd';
const { Text } = Typography

@connect(mapStateToProps, mapDispatchToProps)
class Register extends Component {
  constructor(props) {
    super(props);

    this.state = {
      teamName: "",
      organizationName: "",
      email: "",
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
    const { teamName, email, password, organizationName } = this.state;
    const { register, invitationToken } = this.props
    analyticsLogger.logEvent("ACTION_REGISTER", { "email": email })
    register(
      teamName,
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
        <Text strong>
          Register
        </Text>
        {
          showOrgCreation ? (
            <Form onSubmit={this.registerUser}>
              <Text>
                To easily manage devices, Console provides a logical structure with Organizations, Teams, and devices. Define an Organization name as the top level of your structure, (usually your company name). Organizations can contain Teams, and Teams can contain devices.
              </Text>
              <br />
              <Text>
                The Organization name is used when inviting other users to your Console. Teams make managing multiple devices easier by providing a way to easily segment and identify owners of devices.
              </Text>

              <Form.Item>
                <Input
                  placeholder="Organization Name"
                  name="organizationName"
                  value={this.state.organizationName}
                  onChange={this.handleInputUpdate}
                />
              </Form.Item>

              <Form.Item>
                <Input
                  placeholder="Team Name"
                  name="teamName"
                  value={this.state.teamName}
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

              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Button type="primary" htmlType="submit" disabled={!acceptedTerms}>
                  Register
                </Button>

                <Button onClick={() => this.props.history.push('/login')}>
                  Login
                </Button>
              </div>
            </Form>
          )
        }
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

        <Checkbox checked={acceptedTerms} onChange={() => this.setState({ acceptedTerms: !acceptedTerms })}>
          I accept and have read the <Link to="/terms" target="_blank">Helium Privacy Statement</Link>.
        </Checkbox>
      </div>
    )
  }

  render() {
    const { version } = this.props

    return(
      <AuthLayout>
        <img src={Logo} style={{width: 150, margin: "auto", display: "block"}} />
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
      inviter: queryParams.inviter
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
