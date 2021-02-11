import React, { Component } from 'react'
import TopBar from './TopBar'
import NavDrawer from './NavDrawer'
import ContentLayout from './ContentLayout'
import { Layout, Tag, Popover, Button } from 'antd';
import { ToolOutlined } from '@ant-design/icons';
const { Header, Footer, Sider, Content } = Layout;

class DashboardLayout extends Component {
  render() {
    const { classes, title, extra, breadCrumbs, noSideNav, noHeaderPadding, user, fullHeightWidth } = this.props;

    return (
      <Layout>
        <Header>
          <TopBar user={user} />
        </Header>

        <Layout>
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
                      <Button className="version-link" icon={<ToolOutlined />} href={process.env.RELEASE_BLOG_LINK || "https://engineering.helium.com"} target="_blank">{process.env.CONSOLE_VERSION}</Button>
                    </Popover>
                }
              </Sider>
            )
          }
          <Layout style={{ position: 'relative', minHeight: '100vh' }}>
            <Content style={{ paddingBottom: '2.5rem'}}>
              {
                fullHeightWidth ? (
                  <div style={{ height: '100%', width: '100%'}}>
                  {this.props.children}
                  </div>
                ) : (
                  <ContentLayout title={title} extra={extra} breadCrumbs={breadCrumbs} noHeaderPadding={noHeaderPadding}>
                  {this.props.children}
                  </ContentLayout>
                )
              }
              <Footer style={{ height: '2.5rem', textAlign: 'center', padding: '10px 10px', bottom: '0', position: 'absolute', width: '100%' }}>
                <div style={{ flexDirection: 'row', display: 'flex' }}>
                <a href='http://console.helium.com' target="_blank" style={{ color: '#556B8C', marginRight: '25px', fontWeight: 'bold' }}>console.helium.com</a>
                  {[
                      { title: 'Documentation & Tutorials', url: 'https://docs.helium.com/use-the-network/console'},
                      { title: 'How-to Videos', url: 'https://www.youtube.com/playlist?list=PLtKQNefsR5zNjWkXqdRXeBbSmYWRJFCuo' },
                      { title: 'Community Discord', url: 'http://chat.helium.com' },
                      { title: 'Engineering Blog', url: 'http://engineering.helium.com' }
                    ].map(link =>
                      <a href={link.url} target="_blank" style={{ color: '#556B8C', marginRight: '20px' }}>{link.title}</a>
                    )}
                  <div style={{ marginLeft: 'auto' }}>© 2021 Helium Systems Inc.</div>
                </div>
              </Footer>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    )
  }
}

export default DashboardLayout
