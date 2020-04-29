import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { parse } from 'query-string'
import { register } from '../../actions/auth.js';
import { joinOrganization } from '../../actions/organization'
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
    const { joinOrganization, invitationToken } = this.props
    analyticsLogger.logEvent("ACTION_REGISTER", { "email": email })
    // Change to accept invitation
    joinOrganization(
      invitationToken
    );
  }

  joinContent = () => {
    const { acceptedTerms, invite } = this.state

    return (
      <div>
        <Card style={{padding: 30, borderRadius: 20, boxShadow: '0 52px 64px -50px #001529'}}>
          <img src={Logo} style={{width: 70, display: "block", margin:'0 auto', marginBottom: 20}} />
          <div style={{textAlign: 'center', marginBottom: 30}}>
            <Title>
              You've been invited to join {invite && invite.organizationName}
            </Title>
          </div>
          <Form onSubmit={this.registerUser}>
            <Row gutter={16} style={{marginTop:10}}>
              <Col sm={12}>
                <Button type="primary" htmlType="submit" style={{width: '100%'}}>
                  Accept Invitation
                </Button>
              </Col>
              <Col sm={12}>
                <Button onClick={() => this.props.history.push('/login')} style={{width: '100%'}}>
                  Reject Invitation
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
      </div>
    )
  }

  render() {
    return(
      <AuthLayout>
        { this.joinContent() }
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
  return bindActionCreators({ joinOrganization, getInvitation }, dispatch);
}

export default Register
