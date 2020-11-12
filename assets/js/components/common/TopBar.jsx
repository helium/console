import React, { Component } from 'react'
import { connect } from 'react-redux'
import { graphql } from 'react-apollo';
import { bindActionCreators } from 'redux'
import { Link } from 'react-router-dom';
import { push } from 'connected-react-router';
import numeral from 'numeral'
import DCIMg from '../../../img/datacredits.svg'
import DCIMgDark from '../../../img/datacredits-dark.svg'
import { logOut } from '../../actions/auth'
import SearchBar from '../search/SearchBar'
import analyticsLogger from '../../util/analyticsLogger'
import { ORGANIZATION_SHOW_DC, ALL_ORGANIZATIONS, TOP_BAR_ORGANIZATIONS_SUBSCRIPTION } from '../../graphql/organizations'
import { primaryBlue, redForTablesDeleteText } from '../../util/colors'
import { Menu, Dropdown, Icon, Typography, Tooltip } from 'antd';
const { Text } = Typography
import Logo from '../../../img/logo-horizontalwhite-symbol.svg'
import ProfileActive from '../../../img/topbar-pf-active.svg'
import ProfileInactive from '../../../img/topbar-pf-inactive.svg'
import { switchOrganization } from '../../actions/organization';
import { OrganizationName } from '../organizations/OrganizationName';
import { OrganizationMenu } from '../organizations/OrganizationMenu';
import NewOrganizationModal from '../organizations/NewOrganizationModal';

const queryOptions = {
  options: props => ({
    variables: {
      id: props.currentOrganizationId
    },
    fetchPolicy: 'cache-and-network',
  })
}

@connect(mapStateToProps, mapDispatchToProps)
@graphql(ORGANIZATION_SHOW_DC, {...queryOptions, name: 'orgShowQuery'})
@graphql(ALL_ORGANIZATIONS, {...queryOptions, name: 'orgsQuery'})
class TopBar extends Component {
  state = {
    visible: false,
    showOrganizationModal: false
  }

  componentDidMount() {
    const { subscribeToMore } = this.props.orgsQuery;

    subscribeToMore({
      document: TOP_BAR_ORGANIZATIONS_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        this.handleSubscriptionAdded();
      }
    })
  }

  handleSubscriptionAdded = () => {
    const { refetch } = this.props.orgsQuery;
    refetch();
  }

  handleClick = e => {
    if (e.key === 'logout') {
      this.props.logOut()
    } else {
      this.props.push(e.key)
    }
  }

  refreshDC = visible => {
    if (visible) this.props.orgShowQuery.refetch()
  }

  openOrganizationModal = () => {
    this.setState({ showOrganizationModal: true })
  }

  closeOrganizationModal = () => {
    this.setState({ showOrganizationModal: false })
  }

  handleOrgMenuClick = (e, orgs) => {
    if (e.key === 'new') {
      return this.openOrganizationModal();
    }
    const selectedOrg = orgs.filter(org => org.id === e.key)[0];
    analyticsLogger.logEvent("ACTION_SWITCH_ORG", {"id": e.key });
    this.props.switchOrganization(selectedOrg);
  }

  render() {
    const { logOut, currentOrganizationName, user } = this.props;
    const { showOrganizationModal } = this.state
    const { organization } = this.props.orgShowQuery;
    const { allOrganizations } = this.props.orgsQuery;
    const otherOrgs = (allOrganizations || []).filter(org => organization && org.id !== organization.id);

    return (
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Link to="/welcome">
            <img src={Logo} style={{height:33, position: 'relative', top: '-2px', display: 'inline-block'}}/>
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <Link to="/welcome">
            <Icon type="home" style={{ color: '#ffffff', fontSize: 18, position: 'relative', top: 2 }}/>
          </Link>
          {
            currentOrganizationName && <SearchBar />
          }
          {
            organization && (
              <Tooltip
                title={
                  <span
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => this.props.push("/datacredits")}
                  >
                    <Text style={{ color: organization.dc_balance > 1000 ? '#ffffff' : '#FF4D4F', fontWeight: 600, fontSize: 16 }}>{organization.dc_balance > 1000 ? "DC Balance" : "Your DC Balance is Low"}</Text>
                    <Text style={{ color: '#ffffff' }}>{organization.dc_balance > 1000 ? "Click here to Manage" : "Click here to Top Up"}</Text>
                  </span>
                }
                onVisibleChange={this.refreshDC}
              >
                <div style={{ height: 30, backgroundColor: organization.dc_balance > 1000 ? '#000000' : '#FF4D4F', borderRadius: 30, paddingLeft: 10, paddingRight: 10, marginLeft: 6 }}>
                  <img style={{ width: 15, position: 'relative', top: -13, marginRight: 4 }} src={organization.dc_balance > 1000 ? DCIMg : DCIMgDark} />
                    <Text
                      style={{ color: organization.dc_balance > 1000 ? 'white' : 'black', position: 'relative', top: -12, cursor: 'default' }}
                    >
                      {numeral(organization.dc_balance).format('0,0')}
                    </Text>
                </div>
              </Tooltip>
            )
          }
        </div>

        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', height: 55, alignItems: 'flex-end'}}>
            <Text style={{ color: "#FFFFFF", fontWeight: 500, position: 'relative', top: -7 }}>{user && user.email}</Text>
            <div style={{ position: 'relative', top: -45 }}>
            {otherOrgs.length > 0 ? 
                <Dropdown overlay={<OrganizationMenu current={currentOrganizationName} orgs={otherOrgs} handleClick={e => { this.handleOrgMenuClick(e, otherOrgs) }} />} placement="bottomRight">
                  <OrganizationName name={currentOrganizationName} />
                </Dropdown>
                : <OrganizationName name={currentOrganizationName} />
              }
            </div>
          </div>
          <Dropdown overlay={menu(this.handleClick, currentOrganizationName)} trigger={['click']} onVisibleChange={visible => this.setState({ visible })}>
            <img src={this.state.visible ? ProfileActive : ProfileInactive} style={{ height:30, marginLeft: 15, cursor: 'pointer' }}/>
          </Dropdown>
        </div>

        <NewOrganizationModal
          open={showOrganizationModal}
          onClose={this.closeOrganizationModal}
        />
      </div>
    )
  }
}

const menu = (handleClick, currentOrganizationName) => (
  <Menu onClick={handleClick} style={{ textAlign: 'right' }}>
    {
      currentOrganizationName && (
        <Menu.Item key="/profile">
          <Text>My Account</Text>
        </Menu.Item>
      )
    }
    <Menu.Item key="logout">
      <Text style={{ color: redForTablesDeleteText }}>Log Out</Text>
    </Menu.Item>
  </Menu>
)

function mapStateToProps(state, ownProps) {
  return {
    currentOrganizationName: state.organization.currentOrganizationName,
    currentOrganizationId: state.organization.currentOrganizationId,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ logOut, push, switchOrganization }, dispatch);
}

export default TopBar