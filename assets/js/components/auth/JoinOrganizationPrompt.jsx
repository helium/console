import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { parse } from "query-string";
import { joinOrganization } from "../../actions/organization";
import { getInvitation } from "../../actions/invitation.js";
import AuthLayout from "../common/AuthLayout";
import Logo from "../../../img/symbol.svg";
import { Typography, Button, Card, Row, Col } from "antd";
const { Title } = Typography;
import { logOut } from "../../actions/auth";

@connect(mapStateToProps, mapDispatchToProps)
class JoinOrganizationPrompt extends Component {
  state = {
    organizationName: "",
    email: "",
    firstRender: true,
  };

  componentDidMount() {
    this.setState({ firstRender: false });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.firstRender && !this.state.firstRender) {
      const { invitationToken, getInvitation } = this.props;

      getInvitation(invitationToken).then((invite) =>
        this.setState({ email: invite.email, invite })
      );
    }
  }

  acceptInvitation = (e) => {
    e.preventDefault();
    const { joinOrganization, invitationToken } = this.props;
    joinOrganization(invitationToken);
  };

  render() {
    const { invite } = this.state;
    const { logOut } = this.props;
    return (
      <AuthLayout>
        <div>
          <Card
            style={{
              padding: 30,
              borderRadius: 20,
              boxShadow: "0 52px 64px -50px #001529",
            }}
          >
            <img
              src={Logo}
              style={{
                width: 70,
                display: "block",
                margin: "0 auto",
                marginBottom: 20,
              }}
            />
            <div style={{ textAlign: "center", marginBottom: 30 }}>
              {invite &&
                (this.props.user.sub === invite.inviter_id ? (
                  <div>
                    This invite was created by the same email you're currently
                    logged in with (<b>{this.props.user.email}</b>). You cannot
                    accept or reject the invite under this login.
                  </div>
                ) : (
                  <Title>
                    You've been invited to join{" "}
                    {invite && invite.organizationName}
                  </Title>
                ))}
              {!invite && <Title>Searching for invite...</Title>}
            </div>

            {invite && this.props.user.sub === invite.inviter_id ? (
              <Button onClick={logOut} style={{ width: "100%" }} danger>
                Log Out
              </Button>
            ) : (
              <Row gutter={16} style={{ marginTop: 10 }}>
                <Col sm={12}>
                  <Button
                    disabled={!invite}
                    onClick={() => this.props.history.push("/devices")}
                    style={{ width: "100%" }}
                  >
                    Reject Invitation
                  </Button>
                </Col>
                <Col sm={12}>
                  <Button
                    disabled={!invite}
                    type="primary"
                    onClick={this.acceptInvitation}
                    style={{ width: "100%" }}
                  >
                    Accept Invitation
                  </Button>
                </Col>
              </Row>
            )}
          </Card>
        </div>
      </AuthLayout>
    );
  }
}

function mapStateToProps(state, ownProps) {
  let queryParams = parse(ownProps.location.search);
  if (queryParams.invitation !== undefined) {
    return {
      invitationToken: queryParams.invitation,
    };
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    { joinOrganization, getInvitation, logOut },
    dispatch
  );
}

export default JoinOrganizationPrompt;
