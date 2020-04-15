import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import Logo from '../../../img/logo-horizontalwhite.svg'
import { Link } from 'react-router-dom';
import { push } from 'connected-react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Menu, Icon, Typography } from 'antd'
import truncate from 'lodash/truncate'
const { SubMenu } = Menu
const { Text } = Typography
import { graphql } from 'react-apollo';
import { MENU_LABELS, LABEL_SUBSCRIPTION } from '../../graphql/labels'
import { labelColorsHex } from './LabelTag'
import { grayForHideLabelsDash } from '../../util/colors'

const queryOptions = {
  options: props => ({
    fetchPolicy: 'cache-and-network',
  })
}

@withRouter
@graphql(MENU_LABELS, queryOptions)
@connect(null, mapDispatchToProps)
class NavDrawer extends Component {
  state = {
    showLabels: true
  }

  componentDidMount() {
    const { subscribeToMore, fetchMore } = this.props.data

    subscribeToMore({
      document: LABEL_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        fetchMore({
          updateQuery: (prev, { fetchMoreResult }) => fetchMoreResult
        })
      }
    })
  }

  handleClick = e => {
    this.props.push(e.key)
  }

  render() {
    const { history, data } = this.props
    const { showLabels } = this.state

    return (
      <div>
        <Menu
          mode="inline"
          theme="dark"
          onClick={this.handleClick}
        >
          <Menu.Item disabled={history.location.pathname === "/dashboard"} key="/dashboard"><Icon type="dashboard"/>Dashboard</Menu.Item>
          <Menu.Item disabled={history.location.pathname === "/devices"} key="/devices"><Icon type="appstore" />Devices</Menu.Item>
          <Menu.Item disabled={history.location.pathname === "/integrations"} key="/integrations"><Icon type="api" />Integrations</Menu.Item>
          <Menu.Item disabled={history.location.pathname === "/users"} key="/users"><Icon type="user" />Users</Menu.Item>
          <Menu.Item disabled={history.location.pathname === "/datacredits"} key="/datacredits"><Icon type="wallet" />Data Credits</Menu.Item>
          <Menu.Item disabled={history.location.pathname === "/labels"} key="/labels"><Icon type="tag" />Labels</Menu.Item>
        </Menu>
        {
          showLabels ? (
            <p
              style={{ color: grayForHideLabelsDash, position: "absolute", top: 291, left: 170, fontSize: 20, fontWeight: 300, transform: 'scale(1.5,1)', cursor: 'pointer' }}
              onClick={() => this.setState({ showLabels: false })}
            >
              -
            </p>
          ) : (
            <p
              style={{ color: grayForHideLabelsDash, position: "absolute", top: 291, left: 170, fontSize: 20, fontWeight: 300, cursor: 'pointer' }}
              onClick={() => this.setState({ showLabels: true })}
            >
              +
            </p>
          )
        }
        <div style={{ position: "absolute", top: 330, left: 0, padding: 10, paddingLeft: 24, width: 300, backgroundColor: '#020B13' }}>
          {
            showLabels && data.allLabels && data.allLabels.map(l => (
              <Link to={`/labels/${l.id}`} key={l.id}>
                <LabelRow text={truncate(l.name, { length: '18' })} color={l.color}/>
              </Link>
            ))
          }
        </div>
      </div>
    )
  }
}

const LabelRow = ({ text, color }) => (
  <div>
    <Icon type="tag" theme="filled" style={{ color: color ? labelColorsHex[color] : labelColorsHex['geekblue'], marginRight: 10  }} />
    <Text style={{ color: 'white', fontSize: 12 }}>{text}</Text>
  </div>
)

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ push }, dispatch)
}

export default NavDrawer
