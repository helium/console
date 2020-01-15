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
      <Layout style={{width: '100%'}}>
      <Header>
            <TopBar />
          </Header>

      <Layout style={{ height: 'calc(100vh - 64px)' }}>

        <Sider>
          <NavDrawer />
        </Sider>
        <Layout>
          
          <Content><ContentLayout title={title}>
            {this.props.children}
          </ContentLayout></Content>
        </Layout>
      </Layout>
      </Layout>
    )
  }
}

export default DashboardLayout
