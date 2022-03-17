import React, { Component } from "react";
import { connect } from "react-redux";
import moment from 'moment'
import NavDrawer from './NavDrawer'
import SurveyNotification from "../common/SurveyNotification";
import withGql from "../../graphql/withGql";
import {
  ORGANIZATION_SHOW_DC,
} from "../../graphql/organizations";
import { Layout, Typography } from "antd";
import Close from "../../../img/mobile/nav-drawer-close.svg";
import Dropdown from "../../../img/mobile/nav-drawer-dropdown.svg";
const { Text } = Typography;

class MobileLayout extends Component {
  state = {
    showNav: false,
    showSurveyNotification: false,
  };

  componentDidMount() {
    const { socket } = this.props;

    this.channel = socket.channel("graphql:mobile_topbar_orgs", {});
    this.channel.join();
    this.channel.on(
      `graphql:mobile_topbar_orgs:${this.props.currentOrganizationId}:survey_submitted`,
      (message) => {
        this.props.orgShowQuery.refetch();
      }
    );
  }

  componentDidUpdate(prevProps) {
    if (!process.env.SELF_HOSTED && !prevProps.orgShowQuery.organization && this.props.orgShowQuery.organization) {
      this.setState({ showSurveyNotification: true })
    }
  }

  toggleNav = () => {
    window.Intercom('update', { "hide_default_launcher": this.state.showNav });
    this.setState({ showNav: !this.state.showNav });
  };

  toggleSurveyNotification = () => {
    this.setState({ showSurveyNotification: !this.state.showSurveyNotification });
  };

  render() {
    const organization = this.props.orgShowQuery.organization || null;

    return (
      <Layout style={{ height: "100%", width: "100%", backgroundColor: "#F5F7F9", }}>
        <div style={{ height: 50, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 15, paddingRight: 15 }}>
          <img
            draggable="false"
            src={Dropdown}
            style={{ height: 17, cursor: 'pointer' }}
            onClick={this.toggleNav}
          />
          {
            organization && (
              <div
                style={{ cursor: "pointer" }}
                onClick={this.toggleSurveyNotification}
              >
                <Text
                  className="noselect"
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#88A8C6'
                  }}
                >
                  Claim Data Credits
                  ({
                    moment().to(moment(organization.inserted_at).add(30, "days")).slice(3)
                  })
                </Text>
              </div>
            )
          }
        </div>
        <div style={{ height: 'calc(100% - 50px)', overflowY: 'scroll' }}>
          {this.props.children}
        </div>
        {
          this.state.showNav && (
            <div
              style={{ position: 'absolute', top: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.4)', height: '100%', width: '100%', zIndex: 100 }}
              onClick={(e) => {
                if (e.target.id === 'navdrawer-opaque-bg') this.toggleNav()
              }}
              id="navdrawer-opaque-bg"
            >
              <img
                draggable="false"
                src={Close}
                style={{ position: 'absolute', top: 15, left: 269, height: 16, width: 16, cursor: 'pointer' }}
                onClick={this.toggleNav}
              />
              <NavDrawer toggleNav={this.toggleNav} />
            </div>
          )
        }

        {this.state.showSurveyNotification && (
          <SurveyNotification
            toggleSurveyNotification={this.toggleSurveyNotification}
            organization={organization}
            mobile={true}
          />
        )}
      </Layout>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    currentOrganizationId: state.organization.currentOrganizationId,
    socket: state.apollo.socket,
  };
}

export default connect(
  mapStateToProps,
  null
)(
  withGql(MobileLayout, ORGANIZATION_SHOW_DC, (props) => ({
    fetchPolicy: "cache-first",
    variables: { id: props.currentOrganizationId },
    name: "orgShowQuery",
  }))
)
