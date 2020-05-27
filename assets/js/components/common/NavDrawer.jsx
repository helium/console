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
import { MENU_LABELS, LABEL_SUBSCRIPTION_FOR_NAV } from '../../graphql/labels'
import { labelColorsHex } from './LabelTag'
import { grayForHideLabelsDash } from '../../util/colors'
import classNames from 'classnames';


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
      document: LABEL_SUBSCRIPTION_FOR_NAV,
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
          <div><Link to={"/devices"} className="menu-link"><Icon style={{ marginRight: 8 }} type="appstore"/>Devices</Link></div>
          <div><Link to={"/integrations"} className="menu-link"><Icon style={{ marginRight: 8 }} type="api"/>Integrations</Link></div>
          <div style={{ marginLeft: 0, position: 'relative' }}>
            <Link to={"/labels"} className="menu-link">
              <Icon style={{ marginRight: 8 }} type="tag"/>Labels
            </Link>
            {
              showLabels && data.allLabels && data.allLabels.length > 0 && (
                <p
                  style={{ position: 'absolute', right: 24, top: 28, color: '#53779E', fontSize: 22, fontFamily: 'soleil-light', transform: 'scale(1.5,1)', cursor: 'pointer' }}
                  onClick={() => this.setState({ showLabels: false })}
                >
                  -
                </p>
              )
            }
            {
              !showLabels && data.allLabels && data.allLabels.length > 0 && (
                <p
                  style={{ position: 'absolute', right: 24, top: 28, color: '#53779E', fontSize: 22, fontFamily: 'soleil-light', cursor: 'pointer' }}
                  onClick={() => this.setState({ showLabels: true })}
                >
                  +
                </p>
              )
            }
          </div>
          {
            showLabels && (
              <div>
                {
                  data.allLabels && data.allLabels.map(l => (
                 <div style={{ padding: 8, paddingLeft: 24, width: 300, backgroundColor: '#020B13' }} key={l.id}>
                    <div style={{ padding: 2 }}>
                      <Link to={`/labels/${l.id}`}>
                        <LabelRow text={truncate(l.name, { length: '18' })} color={l.color} deviceCount={l.device_count}/>
                      </Link>
                    </div>
                    </div>
                  ))
                }
              </div>
            )
          }
          <div><Link to={"/functions"} className="menu-link"><Icon style={{ marginRight: 8 }} type="code"/>Functions</Link></div>
          <div><Link to={"/organizations"} className="menu-link"><Icon style={{ marginRight: 8 }} type="switcher"/>Organizations</Link></div>
          <div><Link to={"/users"} className="menu-link"><Icon style={{ marginRight: 8 }} type="user"/>Users</Link></div>
          <div><Link to={"/datacredits"} className="menu-link"><Icon style={{ marginRight: 8 }} type="wallet"/>Data Credits</Link></div>
        </Menu>
      </div>
    )
  }
}

const LabelRow = ({ text, color, deviceCount }) => (
  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
    <div>
      <Icon type="tag" theme="filled" style={{ color: color ? labelColorsHex[color] : labelColorsHex['geekblue'], marginRight: 10}} />
      <Text style={{ color: 'white', fontSize: 12}}>{text}</Text>
    </div>
    {
      deviceCount > 0 &&
      <div style={{
        marginRight: 115,
        borderRadius: 9,
        lineHeight: 1,
        backgroundColor: color ? labelColorsHex[color] : labelColorsHex['geekblue'],
        paddingLeft: 7,
        paddingRight: 7
      }}>
        <Text
          style={{
            fontSize: 12,
          }}>{deviceCount}</Text>
      </div>
    }
  </div>
)

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ push }, dispatch)
}

export default NavDrawer
