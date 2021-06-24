import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { parse } from 'query-string'
import { joinOrganization } from '../../actions/organization'
import { getInvitation } from '../../actions/invitation.js'
import AuthLayout from '../common/AuthLayout'
import Logo from '../../../img/symbol.svg'
import { Typography, Button, Card, Row, Col } from 'antd'
const { Title } = Typography

@connect(mapStateToProps, mapDispatchToProps)
class JoinOrganizationPrompt extends Component {
  state = {
    organizationName: "",
    email: "",
    showOrgCreation: false,
    acceptedTerms: false,
  }

  componentDidUpdate(prevProps) {
    const { invitationToken, getInvitation } = this.props
    if (!prevProps.loaded && this.props.loaded && invitationToken) {
      getInvitation(invitationToken)
      .then(invite => this.setState({ email: invite.email, invite }))
    }
  }

  acceptInvitation = (e) => {
    e.preventDefault()
    const { joinOrganization, invitationToken } = this.props
    joinOrganization(
      invitationToken
    );
  }

  render() {
    const { invite } = this.state;
    return(
      <AuthLayout>
        <div>
          <Card style={{padding: 30, borderRadius: 20, boxShadow: '0 52px 64px -50px #001529'}}>
            <img src={Logo} style={{width: 70, display: "block", margin:'0 auto', marginBottom: 20}} />
            <div style={{textAlign: 'center', marginBottom: 30}}>
              {
                invite ? (
                  <Title>
                    You've been invited to join {invite && invite.organizationName}
                  </Title>
                ) : (
                  <Title>
                    Searching for invite...
                  </Title>
                )
              }
            </div>

            <Row gutter={16} style={{marginTop:10}}>
              <Col sm={12}>
                <Button onClick={() => this.props.history.push('/devices')} style={{width: '100%'}}>
                  Reject Invitation
                </Button>
              </Col>
              <Col sm={12}>
                <Button type="primary" onClick={this.acceptInvitation} style={{width: '100%'}}>
                  Accept Invitation
                </Button>
              </Col>
            </Row>
          </Card>
        </div>
      </AuthLayout>
    )
  }
}

function mapStateToProps(state, ownProps) {
  let queryParams = parse(ownProps.location.search)
  if (queryParams.invitation !== undefined) {
    return {
      invitationToken: queryParams.invitation,
    }
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ joinOrganization, getInvitation }, dispatch);
}

export default JoinOrganizationPrompt
