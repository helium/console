import React, { Component } from 'react'
import TopBar from './TopBar'
import NavDrawer from './NavDrawer'
import ContentLayout from './ContentLayout'
import { Layout, Tag, Icon } from 'antd';
const { Header, Footer, Sider, Content } = Layout;

class DashboardLayout extends Component {
  render() {
    const { classes, title, extra, breadCrumbs, noSideNav, noHeaderPadding } = this.props;

    return (
      <Layout style={{width: '100%', minWidth: 800 }}>
      <Header>
            <TopBar />
          </Header>

      <Layout style={{ height: 'calc(100vh - 64px)' }}>
        {
          !noSideNav && (
            <Sider style={{ overflow: 'hidden' }}>
              <NavDrawer />
              <Tag style={{position: 'absolute', textAlign:'center', bottom: 20, left: 20}} color="#00274c"><Icon type="tool" /> Version 0.7</Tag>
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
