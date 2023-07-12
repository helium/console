import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { logOut } from "../../actions/auth";
import { createAcceptedTerm, fetchAcceptedTerm, setAcceptedTermsTrue } from "../../actions/acceptedTerms";
import React, { Component } from "react";
import TopBar from "./TopBar";
import NavDrawer from "./NavDrawer";
import ContentLayout from "./ContentLayout";
import AuthLayout from "./AuthLayout";
import AddResourceButton from "./AddResourceButton";
import Footer from "./Footer";
import Logo from "../../../img/symbol.svg";
import { Layout, Popover, Button, Card, Row, Col, Form, Typography, Spin } from "antd";
import ToolOutlined from "@ant-design/icons/ToolOutlined";
const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;

export const SurveyNotificationContext = React.createContext();

class DashboardLayout extends Component {
  state = {
    showNav: true,
    showSurveyNotification: false,
    loading: this.props.acceptedTerms ? false : true
  };

  toggleNav = () => {
    this.setState({ showNav: !this.state.showNav });
  };
  toggleSurveyNotification = () => {
    this.setState({
      showSurveyNotification: !this.state.showSurveyNotification,
    });
  };

  handleSubmit = (e) => {
    e.preventDefault();

    createAcceptedTerm(this.props.user.email)
  };

  componentDidMount() {
    const termsGateActive = !!(window.latest_terms_version || process.env.LATEST_TERMS_VERSION)

    if (termsGateActive && !this.props.acceptedTerms) {
      fetchAcceptedTerm(this.props.user.email)
      .then(response => {
        const acceptedTermsInDb = response.data.accepted

        if (acceptedTermsInDb) {
          this.props.setAcceptedTermsTrue()
        }

        this.setState({ loading: false })
      })
    } else {
      this.props.setAcceptedTermsTrue()
      this.setState({ loading: false })
    }
  }

  render() {
    const {
      classes,
      title,
      extra,
      breadCrumbs,
      noSideNav,
      noHeaderPadding,
      user,
      fullHeightWidth,
      noFooter,
      noAddButton,
      full,
      underTitle,
      termsLink,
      mainLogo,
      logOut
    } = this.props;

    const latestTermsVersion = window.latest_terms_version || process.env.LATEST_TERMS_VERSION
    const consoleDefaultTermsLink = process.env.ENV_DOMAIN === 'console-vip.helium.com' ? "/terms-vip" : "/terms"

    if (this.state.loading) return (
        <div style={{
          height: "100%",
          width: "100%",
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Spin size="large" />
        </div>
    )

    if (latestTermsVersion && !this.props.acceptedTerms) {
      return (
        <AuthLayout noSideNav>
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
            <>
              <div style={{ textAlign: "center", marginBottom: 30 }}>
                <Title>Helium Console</Title>
                <Text
                  style={{
                    color: '#38A2FF',
                    fontSize: 18,
                    fontWeight: 300,
                  }}
                >
                  We have updated our Terms of Service
                </Text>
              </div>
              <Text style={{ display: "block" }}>
                I have read and agree to the <a target="_blank" href={termsLink || consoleDefaultTermsLink}> terms and conditions</a>
              </Text>

              <Form onSubmit={this.handleSubmit}>
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
                      onClick={this.handleSubmit}
                      style={{ width: "100%", marginBottom: 4 }}
                    >
                      I Agree
                    </Button>
                  </Col>

                  <Col sm={12}>
                    <Button
                      onClick={logOut}
                      style={{ width: "100%", marginBottom: 4 }}
                    >
                      Logout
                    </Button>
                  </Col>
                </Row>
              </Form>
            </>
          </Card>
        </AuthLayout>
      )
    }

    return (
      <Layout style={{ height: "100%", width: "100%" }}>
        <Header>
          <TopBar
            user={user}
            toggleNav={this.toggleNav}
            showNav={this.state.showNav}
            showSurveyNotification={this.state.showSurveyNotification}
            toggleSurveyNotification={this.toggleSurveyNotification}
          />
        </Header>

        <Layout style={{ height: "calc(100vh - 64px)" }}>
          {!noSideNav && (
            <Sider
              style={{
                overflow: "hidden",
                display: this.state.showNav ? "block" : "none",
              }}
            >
              <NavDrawer user={user} />
              {!process.env.SELF_HOSTED && process.env.CONSOLE_VERSION && (
                <Popover
                  content="Click to see release details"
                  placement="right"
                >
                  <Button
                    className="version-link"
                    icon={<ToolOutlined />}
                    href={
                      process.env.RELEASE_BLOG_LINK ||
                      "https://engineering.helium.com"
                    }
                    target="_blank"
                  >
                    {process.env.CONSOLE_VERSION}
                  </Button>
                </Popover>
              )}
              {process.env.SELF_HOSTED && (
                <Button
                  className="version-link"
                  icon={<ToolOutlined />}
                  href="https://engineering.helium.com/2022/08/04/console-updates-2.2.20.html"
                  target="_blank"
                >
                  v2.2.42
                </Button>
              )}
            </Sider>
          )}
          <Layout>
            <Content
              style={{ height: "calc(100vh - 55px)", overflowY: "scroll" }}
            >
              {fullHeightWidth ? (
                <div
                  style={{
                    height: "100%",
                    width: "100%",
                    backgroundColor: "#F5F7F9",
                  }}
                >
                  {this.props.children}
                </div>
              ) : (
                <ContentLayout
                  title={title}
                  extra={extra}
                  breadCrumbs={breadCrumbs}
                  noHeaderPadding={noHeaderPadding}
                  full={full}
                  underTitle={underTitle}
                >
                  <SurveyNotificationContext.Provider
                    value={{
                      toggleSurveyNotification: this.toggleSurveyNotification,
                    }}
                  >
                    {this.props.children}
                  </SurveyNotificationContext.Provider>
                </ContentLayout>
              )}
              {!noFooter && <Footer />}
            </Content>
            {!noAddButton && <AddResourceButton />}
          </Layout>
        </Layout>
      </Layout>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    termsLink: state.appConfig.termsLink,
    mainLogo: state.appConfig.mainLogo,
    config: state.appConfig,
    acceptedTerms: state.acceptedTerms
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      logOut, setAcceptedTermsTrue
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(DashboardLayout);
