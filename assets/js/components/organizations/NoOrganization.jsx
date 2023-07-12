import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import {
  createOrganization,
  importOrganization,
} from "../../actions/organization";
import { getInvitations, resendInvitations } from "../../actions/invitation";
import { logOut } from "../../actions/auth";
import AuthLayout from "../common/AuthLayout";
import DragAndDrop, { style as dropStyle } from "../common/DragAndDrop";
import Logo from "../../../img/symbol.svg";
import { primaryBlue, blueForDeviceStatsLarge } from "../../util/colors";
import {
  Card,
  Input,
  Button,
  Typography,
  Row,
  Col,
  Form,
  Spin,
  Alert
} from "antd";
import LoadingOutlined from "@ant-design/icons/LoadingOutlined";
const { Text, Title } = Typography;

export default ({ user }) => {
  const dispatch = useDispatch();
  const mainLogo = useSelector((state) => state.appConfig.mainLogo);
  const appName = useSelector((state) => state.appConfig.appName);

  const [name, setName] = useState("");
  const [invitationsLoading, setInvitationsLoading] = useState(true);
  const [invitations, setInvitations] = useState([]);
  const [invitationResent, setInvitationResent] = useState(false);
  const [showImportOrg, setShowImportOrg] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importFailed, setImportFailed] = useState(false);

  const fetchInvitations = async () => {
    getInvitations(user.email)
      .then((invitations) => {
        setInvitations(invitations);
      })
      .finally(() => setInvitationsLoading(false));
  };

  const resend = async () => {
    resendInvitations(user.email).then((result) => {
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
            src={mainLogo || Logo}
            style={{
              width: 70,
              display: "block",
              margin: "0 auto",
              marginBottom: 20,
            }}
          />
          {!showImportOrg && invitations.length > 0 && (
            <>
              <div style={{ textAlign: "center", marginBottom: 30 }}>
                <Title>{ appName || "Helium Console" }</Title>
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
          )}
          {!showImportOrg && invitations.length == 0 && (
            <>
              <div style={{ textAlign: "center", marginBottom: 30 }}>
                <Title>{ appName || "Helium Console" }</Title>
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
                    marginTop: 10,
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

          {showImportOrg && (
            <div style={{ textAlign: "center", marginBottom: 10 }}>
              <Title>{ appName || "Helium Console" }</Title>
              <Text
                style={{
                  color: primaryBlue,
                  fontSize: 18,
                  fontWeight: 300,
                }}
              >
                Import Your Organization
              </Text>
              <Alert
                type="warning"
                message="Ensure imported devices are deactivated on the original Console before attempting to rejoin them on this Console."
                style={{ fontSize: "16px", marginTop: 10 }}
              />
            </div>
          )}
          {showImportOrg && importFailed && (
            <div style={dropStyle}>
              <Text
                style={{
                  textAlign: "center",
                  margin: "30px 40px",
                  fontSize: 14,
                  color: blueForDeviceStatsLarge,
                }}
              >
                <span style={{ display: "block", marginBottom: 10 }}>
                  Failed to import organization with provided file
                </span>
                <Button size="small" onClick={() => setImportFailed(false)}>
                  Try Again
                </Button>
              </Text>
            </div>
          )}
          {showImportOrg && !importFailed && (
            <DragAndDrop
              fileSelected={(file) => {
                let fileReader = new FileReader();
                fileReader.onloadend = () => {
                  setImporting(true);

                  importOrganization(fileReader.result)
                    .then((resp) => {
                      window.location.reload(true);
                    })
                    .catch((err) => {
                      setImportFailed(true);
                      setImporting(false);
                    });
                };
                fileReader.readAsText(file);
              }}
            >
              {importing ? (
                <LoadingOutlined
                  style={{ fontSize: 50, color: "#38A2FF", margin: 20 }}
                  spin
                />
              ) : (
                <Text
                  style={{
                    textAlign: "center",
                    margin: "30px 40px",
                    fontSize: 16,
                    color: blueForDeviceStatsLarge,
                  }}
                >
                  Drag exported organization .json file here or click to choose
                  file
                </Text>
              )}
            </DragAndDrop>
          )}
          <Button
            onClick={() => setShowImportOrg(!showImportOrg)}
            style={{ width: "100%", marginTop: 20 }}
          >
            {showImportOrg
              ? "Take me back"
              : "I want to import an organization"}
          </Button>
        </Card>
      )}
    </AuthLayout>
  );
};
