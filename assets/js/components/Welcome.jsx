import React, { Component } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "./common/DashboardLayout";
import MobileLayout from "./mobile/MobileLayout";
import { MobileDisplay, DesktopDisplay } from "./mobile/MediaQuery";
import analyticsLogger from "../util/analyticsLogger";
import { isMobile, minWidth } from "../util/constants";
import { Checkbox, Row, Card, Col, Typography } from "antd";
import RocketFilled from "@ant-design/icons/RocketFilled";
import CalendarFilled from "@ant-design/icons/CalendarFilled";
import CaretRightOutlined from "@ant-design/icons/CaretRightOutlined";
import WelcomeImg from "../../img/welcome-image.png";
import _JSXStyle from "styled-jsx/style";
const { Text } = Typography;

class Welcome extends Component {
  state = {
    hideWelcomeScreen: localStorage.getItem("hideWelcomeScreen"),
  };

  componentDidMount() {
    analyticsLogger.logEvent(
      isMobile ? "ACTION_NAV_WELCOME_PAGE_MOBILE" : "ACTION_NAV_WELCOME_PAGE"
    );
  }

  onChangeCheckbox = () => {
    if (localStorage.getItem("hideWelcomeScreen")) {
      localStorage.removeItem("hideWelcomeScreen");
      this.setState({ hideWelcomeScreen: false });
    } else {
      localStorage.setItem("hideWelcomeScreen", "hidden");
      this.setState({ hideWelcomeScreen: true });
    }
  };

  render() {
    return (
      <>
        <MobileDisplay>
          <MobileLayout>
            <div style={{ backgroundColor: "#ffffff", padding: 15 }}>
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  marginBottom: 30,
                }}
              >
                <img src={WelcomeImg} style={{ height: 68 }} />
              </div>
              <span>
                <Text style={{ fontSize: 30, display: "block" }}>
                  Welcome to
                </Text>
                <Text
                  style={{
                    fontSize: 36,
                    display: "block",
                    fontWeight: 600,
                    position: "relative",
                    top: -16,
                  }}
                >
                  Helium Console
                </Text>
              </span>
              <div
                style={{
                  backgroundColor: "#F5F7F9",
                  padding: "15px 20px 15px 20px",
                  borderRadius: 10,
                  marginTop: 15,
                  marginBottom: 15,
                }}
              >
                <Text strong style={{ fontSize: 16, display: "block" }}>
                  Developer Docs are Live!
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: "#6A81A4",
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  Looking for some guidance to get started?
                </Text>
                <a href="https://docs.helium.com/" target="_blank">
                  <Text
                    style={{ fontSize: 16, fontWeight: 500, color: "#2C79EE" }}
                  >
                    Click Here
                  </Text>
                </a>
              </div>
              <div
                style={{
                  backgroundColor: "#F5F7F9",
                  padding: "20px 20px 10px 20px",
                  borderRadius: 10,
                  marginBottom: 15,
                }}
              >
                <Row>
                  <RocketFilled className="bigicon" />
                  <h2>Get Started with Console</h2>
                </Row>
                {getStartedLinks(true)}
              </div>
              <div
                style={{
                  backgroundColor: "#F5F7F9",
                  padding: "20px 20px 10px 20px",
                  borderRadius: 10,
                }}
              >
                <Row>
                  <CalendarFilled className="bigicon" id="purple" />
                  <h2>Developer Resources</h2>
                </Row>
                <a
                  href="https://docs.helium.com/use-the-network/console/"
                  target="_blank"
                >
                  <p>
                    <span>View</span> Documentation and Tutorials
                    <CaretRightOutlined className="caret" />
                  </p>
                </a>
                <a
                  href="https://www.youtube.com/playlist?list=PLtKQNefsR5zNjWkXqdRXeBbSmYWRJFCuo"
                  target="_blank"
                >
                  <p>
                    <span>Watch our</span> How-to Videos
                    <CaretRightOutlined className="caret" />
                  </p>
                </a>
                <a href="http://chat.helium.com/" target="_blank">
                  <p>
                    <span>Join our</span> Community Discord Channel
                    <CaretRightOutlined className="caret" />
                  </p>
                </a>
                <a href="https://engineering.helium.com/" target="_blank">
                  <p>
                    <span>Read our</span> Engineering Update Blog
                    <CaretRightOutlined className="caret" />
                  </p>
                </a>
              </div>
            </div>
          </MobileLayout>
        </MobileDisplay>

        <DesktopDisplay>
          <DashboardLayout title="" user={this.props.user}>
            <div
              style={{
                height: "100%",
                width: "100%",
                backgroundColor: "#ffffff",
                borderRadius: 6,
                overflow: "hidden",
                boxShadow: "0px 20px 20px -7px rgba(17, 24, 31, 0.19)",
              }}
            >
              <div style={{ overflowX: "scroll" }} className="no-scroll-bar">
                <div style={{ padding: "60px 30px 30px 30px", minWidth }}>
                  <Row style={{ justifyContent: "space-between" }}>
                    <span>
                      <Text style={{ fontSize: 30, display: "block" }}>
                        Welcome to
                      </Text>
                      <Text
                        style={{
                          fontSize: 36,
                          display: "block",
                          fontWeight: 600,
                          position: "relative",
                          top: -16,
                        }}
                      >
                        Helium Console
                      </Text>
                    </span>

                    <img src={WelcomeImg} style={{ height: 68 }} />
                  </Row>

                  <Checkbox
                    checked={this.state.hideWelcomeScreen ? false : true}
                    style={{ color: "#556B8C" }}
                    onChange={this.onChangeCheckbox}
                  >
                    Show this Welcome Screen every time I log in
                  </Checkbox>

                  <div
                    style={{
                      backgroundColor: "#F5F7F9",
                      padding: "15px 20px 15px 20px",
                      borderRadius: 10,
                      marginTop: 50,
                      marginBottom: 16,
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>
                      <Text strong style={{ fontSize: 16 }}>
                        Developer Docs are Live!
                      </Text>
                      <Text
                        style={{
                          fontSize: 16,
                          color: "#6A81A4",
                          paddingLeft: 20,
                        }}
                      >
                        Looking for some guidance to get started?
                      </Text>
                    </span>
                    <a href="https://docs.helium.com/" target="_blank">
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: 500,
                          color: "#2C79EE",
                        }}
                      >
                        Click Here
                      </Text>
                    </a>
                  </div>

                  <Row gutter={16}>
                    <Col span={12}>
                      <div
                        className="pod"
                        id="left"
                        style={{
                          backgroundColor: "#F5F7F9",
                          padding: "20px 20px 10px 20px",
                          borderRadius: 10,
                        }}
                      >
                        <Row>
                          <RocketFilled className="bigicon" />
                          <h2>Get Started with Console</h2>
                        </Row>
                        {getStartedLinks()}
                      </div>
                    </Col>
                    <Col span={12}>
                      <div
                        className="pod"
                        id="right"
                        style={{
                          backgroundColor: "#F5F7F9",
                          padding: "20px 20px 10px 20px",
                          borderRadius: 10,
                        }}
                      >
                        <Row>
                          <CalendarFilled className="bigicon" id="purple" />
                          <h2>Developer Resources</h2>
                        </Row>
                        <a
                          href="https://docs.helium.com/use-the-network/console/"
                          target="_blank"
                        >
                          <p>
                            <span>View</span> Documentation and Tutorials
                            <CaretRightOutlined className="caret" />
                          </p>
                        </a>
                        <a
                          href="https://www.youtube.com/playlist?list=PLtKQNefsR5zNjWkXqdRXeBbSmYWRJFCuo"
                          target="_blank"
                        >
                          <p>
                            <span>Watch our</span> How-to Videos
                            <CaretRightOutlined className="caret" />
                          </p>
                        </a>
                        <a href="http://chat.helium.com/" target="_blank">
                          <p>
                            <span>Join our</span> Community Discord Channel
                            <CaretRightOutlined className="caret" />
                          </p>
                        </a>
                        <a
                          href="https://engineering.helium.com/"
                          target="_blank"
                        >
                          <p>
                            <span>Read our</span> Engineering Update Blog
                            <CaretRightOutlined className="caret" />
                          </p>
                        </a>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            </div>
          </DashboardLayout>
        </DesktopDisplay>
      </>
    );
  }
}

export const getStartedLinks = (noFunction = false) => (
  <React.Fragment>
    <Link to="/devices">
      <p>
        Add and Manage Devices <span>for the Helium Network</span>
        <CaretRightOutlined className="caret" />
      </p>
    </Link>
    <Link to="/integrations">
      <p>
        Set up an Integration <span>to send and receive device data</span>
        <CaretRightOutlined className="caret" />
      </p>
    </Link>
    {!noFunction && (
      <Link to="/functions">
        <p>
          Apply Functions <span>to your devices</span>
          <CaretRightOutlined className="caret" />
        </p>
      </Link>
    )}
    <Link to="/users">
      <p>
        Invite other Users <span> to your Console Organization</span>
        <CaretRightOutlined className="caret" />
      </p>
    </Link>
  </React.Fragment>
);

export default Welcome;
