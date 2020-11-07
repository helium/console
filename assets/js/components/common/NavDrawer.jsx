import React, { Component } from 'react'
import { withRouter, Link } from 'react-router-dom'
import Logo from '../../../img/logo-horizontalwhite.svg'
import { push } from 'connected-react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Tag, Menu, Icon, Typography } from 'antd'
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

const SHOW_LABELS_KEY = 'showLabels';

@withRouter
@graphql(MENU_LABELS, queryOptions)
@connect(null, mapDispatchToProps)
class NavDrawer extends Component {
  state = {
    showLabels: localStorage.getItem(SHOW_LABELS_KEY) !== 'false'
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
          style={{maxHeight: '82vh', overflowY: 'scroll'}}
        >
          <div><Link to={"/devices"} className="menu-link">Devices</Link></div>
          <div><Link to={"/integrations"} className="menu-link">Integrations</Link></div>
          <div style={{ marginLeft: 0, position: 'relative' }}>
            <Link to={"/labels"} className="menu-link">Labels</Link>
            {
              showLabels && data.allLabels && data.allLabels.length > 0 && (
                <p
                  style={{ position: 'absolute', right: 15, top: 14, color: 'rgb(144, 157, 169)', fontSize: 17, cursor: 'pointer' }}
                  onClick={() => this.setState({ showLabels: false }) || localStorage.setItem(SHOW_LABELS_KEY, 'false')}
                >
                  <Icon type="eye-invisible" theme="filled" />
                </p>
              )
            }
            {
              !showLabels && data.allLabels && data.allLabels.length > 0 && (
                <p
                  style={{ position: 'absolute', right: 15, top: 14, color: 'rgb(144, 157, 169)', fontSize: 17, cursor: 'pointer' }}
                  onClick={() => this.setState({ showLabels: true }) || localStorage.setItem(SHOW_LABELS_KEY, 'true')}
                >
                  <Icon type="eye" theme="filled" />
                </p>
              )
            }
          </div>
          {
            showLabels && (
              <div style={{background: '#d9e2ef', overflowX: 'scroll' }} className="labellist">
                {
                  data.allLabels && data.allLabels.map(l => (
                 <div style={{ paddingTop: 8, paddingLeft: 18, width: '100%' }} key={l.id} className="labelrowwrapper">
                    <div style={{ padding: 2, width: '100%', paddingRight: 18 }}>
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
          <div><Link to={"/functions"} className="menu-link">Functions</Link></div>
          <div><Link to={"/organizations"} className="menu-link">Organizations</Link></div>
          <div><Link to={"/users"} className="menu-link">Users</Link></div>
          <div><Link to={"/datacredits"} className="menu-link">Data Credits</Link></div>
        </Menu>
      </div>
    )
  }
}

const LabelRow = ({ text, color, deviceCount }) => (
  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', whiteSpace: 'nowrap'}} >
    <div style={{ background: color ? labelColorsHex[color] : labelColorsHex['geekblue'], padding: '8px 10px', borderRadius: 4, color: 'white', fontWeight: 600}}><Icon style={{marginRight: 8}} type="tag" theme="filled" />{text}</div>
        {
            deviceCount > 0 &&
      <div style={{
        lineHeight: 1,
        color: '#8391a5',
        fontSize: 16,
        fontWeight: 500,
        textAlign: 'right',

      }}>
       {deviceCount}
      </div>
    }
  </div>
)

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ push }, dispatch)
}

export default NavDrawer