import React, { Component } from 'react'
import TopBar from './TopBar'
import NavDrawer from './NavDrawer'
import ContentLayout from './ContentLayout'
import { Layout, Tag, Icon, Popover, Button } from 'antd';
import { ToolOutlined } from '@ant-design/icons';
const { Header, Footer, Sider, Content } = Layout;

class DashboardLayout extends Component {
  render() {
    const { classes, title, extra, breadCrumbs, noSideNav, noHeaderPadding, user } = this.props;

    return (
      <Layout style={{width: '100%', minWidth: 800 }}>
        <Header>
          <TopBar user={user} />
        </Header>

        <Layout style={{ height: 'calc(100vh - 64px)' }}>
          {
            !noSideNav && (
              <Sider style={{ overflow: 'hidden' }}>
                <NavDrawer />
                {
                  process.env.CONSOLE_VERSION && 
                    <Popover
                      content="Click to see release details"
                      placement="right"
                    >
                      <Button className="version-link" icon="tool" href={process.env.RELEASE_BLOG_LINK || "https://engineering.helium.com"} target="_blank">{process.env.CONSOLE_VERSION}</Button>
                    </Popover>
                }
              </Sider>
            )
          }
          <Layout>
            <Content>
              <ContentLayout title={title} extra={extra} breadCrumbs={breadCrumbs} noHeaderPadding={noHeaderPadding}>
              {this.props.children}
              </ContentLayout>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    )
  }
}

export default DashboardLayout
