import React, { Component } from 'react'

import { withStyles } from '@material-ui/core/styles';
import withTheme from './withTheme.jsx'

import TopBar from './TopBar'
import NavDrawer from './NavDrawer'
import ContentLayout from './ContentLayout'
import { Layout } from 'antd';
const { Header, Footer, Sider, Content } = Layout;


const drawerWidth = 240;

const styles = theme => ({
  root: {
    height: '100vh',
    display: 'flex',
    width: '100%',
  },
});

@withTheme
@withStyles(styles)
class DashboardLayout extends Component {
  render() {
    const { classes, title, tabs } = this.props;

    return (
      <div className={classes.root}>
        <Layout>
          <Sider>
            <NavDrawer />
          </Sider>
          <Layout>
            <Header>
              <TopBar />
            </Header>
            <Content><ContentLayout title={title} tabs={tabs}>
              {this.props.children}
            </ContentLayout></Content>
          </Layout>
        </Layout>
      </div>
    )
  }
}

export default DashboardLayout
