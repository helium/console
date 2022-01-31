import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { createOrganization } from "../../actions/organization";
import { getInvitations, resendInvitations } from "../../actions/invitation";
import { logOut } from "../../actions/auth";
import AuthLayout from "../common/AuthLayout";
import Logo from "../../../img/symbol.svg";
import { primaryBlue } from "../../util/colors";
import { Card, Input, Button, Typography, Row, Col, Form, Spin } from "antd";
const { Text, Title } = Typography;

export default ({ user }) => {
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [invitationsLoading, setInvitationsLoading] = useState(true);
  const [invitations, setInvitations] = useState([]);
  const [invitationResent, setInvitationResent] = useState(false);

  const fetchInvitations = async () => {
    getInvitations(user.email)
      .then((invitations) => {
        setInvitations(invitations);
      })
      .finally(() => setInvitationsLoading(false));
  };

  const resend = async () => {
    resendInvitations(user.email).then((result) => {
      console.log({ result });
      if (result.status === 200) setInvitationResent(true);
    });
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleInputUpdate = (e) => {
    setName(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createOrganization(name, true));
  };

  return (
    <AuthLayout noSideNav>
      {invitationsLoading ? (
        <Spin size="large" />
      ) : (
        <Card
          style={{
            padding: 30,
            paddingTop: 20,
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
          {invitations.length > 0 ? (
            <>
              <div style={{ textAlign: "center", marginBottom: 40 }}>
                <Title>Helium Console</Title>
                <Text
                  style={{
                    color: primaryBlue,
                    fontSize: 18,
                    fontWeight: 300,
                  }}
                >
                  Pending Invitation
                </Text>
              </div>
              <Text style={{ display: "block" }}>
                You need to first accept the pending invitation to proceed to
                Console. <br />
                <br />
                Please check your email (including spam folders) or perform a
                search for an email from the address: <b>console@helium.com</b>.
              </Text>
              <Row
                gutter={16}
                style={{
                  marginTop: 20,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Col sm={12}>
                  <Button
                    type="primary"
                    disabled={invitationResent}
                    onClick={resend}
                    style={{ width: "100%", marginBottom: 4 }}
                  >
                    Resend Invitation
                  </Button>
                </Col>
                <Col sm={12}>
                  <Button
                    onClick={() => dispatch(logOut())}
                    style={{ width: "100%", marginBottom: 4 }}
                  >
                    Logout
                  </Button>
                </Col>
              </Row>
            </>
          ) : (
            <>
              <div style={{ textAlign: "center", marginBottom: 40 }}>
                <Title>Helium Console</Title>
                <Text
                  style={{
                    color: primaryBlue,
                    fontSize: 18,
                    fontWeight: 300,
                  }}
                >
                  Add Your First Organization
                </Text>
              </div>
              <Text style={{ display: "block" }}>
                Define an Organization as the top level of your structure,
                (usually your company name). This Organization name is used when
                inviting other users to your Console.
              </Text>
              <div style={{ textAlign: "center" }}>
                <Input
                  placeholder="New Organization Name"
                  name="name"
                  value={name}
                  onChange={handleInputUpdate}
                  style={{ marginTop: 20 }}
                />
              </div>
              <Form onSubmit={handleSubmit}>
                <Row
                  gutter={16}
                  style={{
                    marginTop: 20,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Col sm={12}>
                    <Button
                      type="primary"
                      onClick={handleSubmit}
                      style={{ width: "100%", marginBottom: 4 }}
                    >
                      Add Organization
                    </Button>
                  </Col>

                  <Col sm={12}>
                    <Button
                      onClick={() => dispatch(logOut())}
                      style={{ width: "100%", marginBottom: 4 }}
                    >
                      Logout
                    </Button>
                  </Col>
                </Row>
              </Form>
            </>
          )}
        </Card>
      )}
    </AuthLayout>
  );
};
