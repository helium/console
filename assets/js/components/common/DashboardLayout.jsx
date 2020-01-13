import React, { Component } from 'react'
import TopBar from './TopBar'
import NavDrawer from './NavDrawer'
import ContentLayout from './ContentLayout'
import { Layout } from 'antd';
const { Header, Footer, Sider, Content } = Layout;

class DashboardLayout extends Component {
  render() {
    const { classes, title } = this.props;

    return (
      <Layout style={{ height: '100vh' }}>
        <Sider>
          <NavDrawer />
        </Sider>
        <Layout>
          <Header>
            <TopBar />
          </Header>
          <Content><ContentLayout title={title}>
            {this.props.children}
          </ContentLayout></Content>
        </Layout>
      </Layout>
    )
  }
}

export default DashboardLayout
