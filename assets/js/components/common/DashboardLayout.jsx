import React, { Component } from 'react'
import TopBar from './TopBar'
import NavDrawer from './NavDrawer'
import ContentLayout from './ContentLayout'
import { Layout, Tag, Icon } from 'antd';
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
                process.env.CONSOLE_VERSION && <Tag style={{position: 'absolute', textAlign:'center', bottom: 20, left: 20, fontSize: 16, fontWeight: 400, color: '#1b1f23', padding: '6px 12px'}} color="#d9e2ef"><Icon type="tool" style={{marginRight: 6}} />{process.env.CONSOLE_VERSION}</Tag>
              }
            </Sider>
          )
        }
        <Layout>
          <Content><ContentLayout title={title} extra={extra} breadCrumbs={breadCrumbs} noHeaderPadding={noHeaderPadding}>
            {this.props.children}
          </ContentLayout></Content>
        </Layout>
      </Layout>
      </Layout>
    )
  }
}

export default DashboardLayout
