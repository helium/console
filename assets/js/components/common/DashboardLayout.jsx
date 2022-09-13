import React, { Component } from "react";
import TopBar from "./TopBar";
import NavDrawer from "./NavDrawer";
import ContentLayout from "./ContentLayout";
import AddResourceButton from "./AddResourceButton";
import Footer from "./Footer";
import { Layout, Popover, Button } from "antd";
import ToolOutlined from "@ant-design/icons/ToolOutlined";
const { Header, Sider, Content } = Layout;

export const SurveyNotificationContext = React.createContext();

class DashboardLayout extends Component {
  state = {
    showNav: true,
    showSurveyNotification: false,
  };

  toggleNav = () => {
    this.setState({ showNav: !this.state.showNav });
  };
  toggleSurveyNotification = () => {
    this.setState({
      showSurveyNotification: !this.state.showSurveyNotification,
    });
  };

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
    } = this.props;

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
                  v2.2.23
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

export default DashboardLayout;
