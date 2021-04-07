import React, { Component } from 'react'
import TopBar from './TopBar'
import NavDrawer from './NavDrawer'
import { NavLink } from 'react-router-dom'
import ContentLayout from './ContentLayout'
import { Layout, Tag, Popover, Button } from 'antd';
import { ToolOutlined, PlusCircleFilled } from '@ant-design/icons';
const { Header, Footer, Sider, Content } = Layout;

class DashboardLayout extends Component {
  state = {
    showNav: true
  }

  toggleNav = () => {
    this.setState({ showNav: !this.state.showNav})
  }

  render() {
    const { classes, title, extra, breadCrumbs, noSideNav, noHeaderPadding, user, fullHeightWidth, noFooter } = this.props;

    return (
      <Layout style={{height: '100%', width: '100%'}}>
        <Header>
          <TopBar user={user} toggleNav={this.toggleNav} showNav={this.state.showNav}/>
        </Header>

        <Layout style={{ height: 'calc(100vh - 64px)' }}>
          {
            !noSideNav && (
              <Sider style={{ overflow: 'hidden', display: this.state.showNav ? 'block' : 'none' }}>
                <NavDrawer user={user}/>
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
          <Layout>
            <Content>
              {
                fullHeightWidth ? (
                  <div style={{ height: '100%', width: '100%', backgroundColor: '#F5F7F9' }}>
                  {this.props.children}
                  </div>
                ) : (
                  <ContentLayout title={title} extra={extra} breadCrumbs={breadCrumbs} noHeaderPadding={noHeaderPadding}>
                  {this.props.children}
                  </ContentLayout>
                )
              }
              {
                !noFooter && (<Footer style={{ flexShrink: '0', padding: '10px 10px', marginBottom: '-150px', overflow: 'hidden' }}>
                  <div style={{ flexDirection: 'row', display: 'flex' }}>
                  <a href='http://console.helium.com' style={{ color: '#556B8C', marginRight: '25px', fontWeight: 'bold' }}>console.helium.com</a>
                    {[
                        { title: 'Documentation & Tutorials', url: 'https://docs.helium.com/use-the-network/console'},
                        { title: 'How-to Videos', url: 'https://www.youtube.com/playlist?list=PLtKQNefsR5zNjWkXqdRXeBbSmYWRJFCuo' },
                        { title: 'Community Discord', url: 'http://chat.helium.com' },
                        { title: 'Engineering Blog', url: 'http://engineering.helium.com' }
                      ].map(link =>
                        <a key={link.title} href={link.url} target="_blank" style={{ color: '#556B8C', marginRight: '20px' }}>{link.title}</a>
                      )}
                    <div style={{ marginLeft: 'auto' }}>© 2021 Helium Systems Inc.</div>
                  </div>
                </Footer>)
              }
            </Content>
            <Popover
              overlayClassName="add-menu-popover"
              content={
                <div style={{ width: 130 }}>
                  <NavLink className="add-menu-selection" activeClassName="is-active" to={"/devices?show_new=true"}>Add Device</NavLink>
                  <NavLink className="add-menu-selection" activeClassName="is-active" to={"/devices?show_new=true"}>Add Label</NavLink>
                  <NavLink className="add-menu-selection" activeClassName="is-active" to={"/functions?show_new=true"}>Add Function</NavLink>
                  <NavLink className="add-menu-selection" activeClassName="is-active" to={"/integrations/new"}>Add Integration</NavLink>
                </div>
              }
              placement="left"
            >
              <PlusCircleFilled
                style={{
                  position: "absolute",
                  bottom: 100,
                  right: 30,
                  fontSize: 40,
                  cursor: 'pointer',
                  zIndex: 100,
                }}
              />
            </Popover>
          </Layout>
        </Layout>
      </Layout>
    )
  }
}

export default DashboardLayout
