import React, { Component } from "react";
import { Layout } from "antd";
import NavDrawer from './NavDrawer'
import Close from "../../../img/mobile/nav-drawer-close.svg";
import Dropdown from "../../../img/mobile/nav-drawer-dropdown.svg";

class MobileLayout extends Component {
  state = {
    showNav: true,
  };

  toggleNav = (e) => {
    e.preventDefault()
    this.setState({ showNav: !this.state.showNav });
  };

  render() {
    return (
      <Layout style={{ height: "100%", width: "100%", backgroundColor: "#F5F7F9", }}>
        {
          this.state.showNav && (
            <div style={{ position: 'absolute', top: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.4)', height: '100%', width: '100%' }}>
              <img
                draggable="false"
                src={Close}
                style={{ position: 'absolute', top: 15, left: 269, height: 16, width: 16, cursor: 'pointer' }}
                onClick={this.toggleNav}
              />
              <NavDrawer />
            </div>
          )
        }
        <div style={{ height: 50, display: 'flex', flexDirection: 'row', alignItems: 'center', paddingLeft: 15 }}>
          <img
            draggable="false"
            src={Dropdown}
            style={{ height: 17, cursor: 'pointer' }}
            onClick={this.toggleNav}
          />
        </div>
        <div style={{ height: 'calc(100% - 50px)'}}>
          {this.props.children}
        </div>
      </Layout>
    );
  }
}

export default MobileLayout;
