import React, { Component } from "react";
import TopBar from "./TopBar";
import NavDrawer from "./NavDrawer";
import ContentLayout from "./ContentLayout";
import AddResourceButton from "./AddResourceButton";
import { Layout, Popover, Button } from "antd";
import ToolOutlined from "@ant-design/icons/ToolOutlined";
const { Header, Footer, Sider, Content } = Layout;

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
    this.setState({ showSurveyNotification: !this.state.showSurveyNotification });
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
                  href="https://engineering.helium.com/2022/05/05/console-updates-2.2.8.html"
                  target="_blank"
                >
                  v2.2.8
                </Button>
              )}
            </Sider>
          )}
          <Layout>
            <Content style={{ height: "calc(100vh - 55px)", overflowY: 'scroll' }}>
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
                  <SurveyNotificationContext.Provider value={{ toggleSurveyNotification: this.toggleSurveyNotification }}>
                    {this.props.children}
                  </SurveyNotificationContext.Provider>
                </ContentLayout>
              )}
              {!noFooter && (
                <Footer
                  className="no-scroll-bar"
                  style={{
                    flexShrink: "0",
                    padding: "10px 10px",
                    marginBottom: "-150px",
                    overflowX: "scroll",
                  }}
                >
                  <div
                    style={{
                      flexDirection: "row",
                      display: "flex",
                      minWidth: 700,
                    }}
                  >
                    <a
                      href="http://console.helium.com"
                      style={{
                        color: "#556B8C",
                        marginRight: "25px",
                        fontWeight: "bold",
                      }}
                    >
                      console.helium.com
                    </a>
                    {[
                      {
                        title: "Documentation & Tutorials",
                        url: "https://docs.helium.com/use-the-network/console",
                      },
                      {
                        title: "How-to Videos",
                        url: "https://www.youtube.com/playlist?list=PLtKQNefsR5zNjWkXqdRXeBbSmYWRJFCuo",
                      },
                      {
                        title: "Community Discord",
                        url: "http://chat.helium.com",
                      },
                      {
                        title: "Engineering Blog",
                        url: "http://engineering.helium.com",
                      },
                      { title: "Terms & Conditions", url: "/terms" },
                    ].map((link) => (
                      <a
                        key={link.title}
                        href={link.url}
                        target="_blank"
                        style={{ color: "#556B8C", marginRight: "20px" }}
                      >
                        {link.title}
                      </a>
                    ))}
                    <div style={{ marginLeft: "auto" }}>
                      © 2021 Helium Systems Inc.
                    </div>
                  </div>
                </Footer>
              )}
            </Content>
            {!noAddButton && <AddResourceButton />}
          </Layout>
        </Layout>
      </Layout>
    );
  }
}

export default DashboardLayout;
