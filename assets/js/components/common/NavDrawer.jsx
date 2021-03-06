import React, { Component } from 'react'
import { withRouter, Link, NavLink } from 'react-router-dom'
import Logo from '../../../img/logo-horizontalwhite.svg'
import { push } from 'connected-react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Tag, Menu, Typography } from 'antd'
import { EyeFilled, EyeInvisibleFilled, TagFilled } from '@ant-design/icons';
import truncate from 'lodash/truncate'
const { SubMenu } = Menu
const { Text } = Typography
import { MENU_LABELS } from '../../graphql/labels'
import { labelColorsHex } from './LabelTag'
import { grayForHideLabelsDash } from '../../util/colors'
import withGql from '../../graphql/withGql'
import classNames from 'classnames';
const SHOW_LABELS_KEY = 'showLabels';

class NavDrawer extends Component {
  state = {
    showLabels: localStorage.getItem(SHOW_LABELS_KEY) !== 'false'
  }

  componentDidMount() {
    const { socket, user } = this.props
    const user_id = user.sub.startsWith("auth0") ? user.sub.slice(6) : user.sub;

    this.channel = socket.channel("graphql:nav_labels", {})
    this.channel.join()
    this.channel.on(`graphql:nav_labels:${user_id}:update_list`, (message) => {
      this.props.allLabelsQuery.refetch()
    })
    }

  componentWillUnmount() {
    this.channel.leave()
  }

  handleClick = e => {
    this.props.push(e.key)
  }

  render() {
    const { history } = this.props
    const { allLabels } = this.props.allLabelsQuery
    const { showLabels } = this.state

    return (
      <div>
        <Menu
          mode="inline"
          onClick={this.handleClick}
          style={{maxHeight: '82vh', overflowY: 'scroll'}}
        >
          <div><NavLink to={"/devices"} activeClassName="is-active" className="menu-link">Devices</NavLink></div>
          <div><NavLink to={"/integrations"} activeClassName="is-active" className="menu-link">Integrations</NavLink></div>
          <div style={{ marginLeft: 0, position: 'relative' }}>
            <NavLink to={"/labels"} activeClassName="is-active" className="menu-link">Labels</NavLink>
            {
              showLabels && allLabels && allLabels.length > 0 && (
                <p
                  style={{ position: 'absolute', right: 15, top: 14, color: 'rgb(144, 157, 169)', fontSize: 17, cursor: 'pointer' }}
                  onClick={() => this.setState({ showLabels: false }) || localStorage.setItem(SHOW_LABELS_KEY, 'false')}
                >
                  <EyeInvisibleFilled />
                </p>
              )
            }
            {
              !showLabels && allLabels && allLabels.length > 0 && (
                <p
                  style={{ position: 'absolute', right: 15, top: 14, color: 'rgb(144, 157, 169)', fontSize: 17, cursor: 'pointer' }}
                  onClick={() => this.setState({ showLabels: true }) || localStorage.setItem(SHOW_LABELS_KEY, 'true')}
                >
                  <EyeFilled />
                </p>
              )
            }
          </div>
          {
            showLabels && (
              <div style={{background: '#d9e2ef', overflowX: 'scroll' }} className="labellist">
                {
                  allLabels && allLabels.map(l => (
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
          <div><NavLink to={"/functions"} activeClassName="is-active" className="menu-link">Functions</NavLink></div>
          <div><NavLink to={"/organizations"} activeClassName="is-active" className="menu-link">Organizations</NavLink></div>
          <div><NavLink to={"/users"} activeClassName="is-active" className="menu-link">Users</NavLink></div>
          <div><NavLink to={"/datacredits"} activeClassName="is-active" className="menu-link">Data Credits</NavLink></div>
          <div><NavLink to={"/flows"} activeClassName="is-active" className="menu-link">Flows (Beta)</NavLink></div>
        </Menu>
      </div>
    )
  }
}

const LabelRow = ({ text, color, deviceCount }) => (
  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', whiteSpace: 'nowrap'}} >
    <div style={{ background: color ? labelColorsHex[color] : labelColorsHex['geekblue'], padding: '8px 10px', borderRadius: 4, color: 'white', fontWeight: 600}}><TagFilled style={{marginRight: 8}} />{text}</div>
      {
        deviceCount > 0 && (
          <div style={{
            lineHeight: 1,
            color: '#8391a5',
            fontSize: 16,
            fontWeight: 500,
            textAlign: 'right',

          }}>
           {deviceCount}
          </div>
        )
      }
  </div>
)

function mapStateToProps(state) {
  return {
    currentOrganizationId: state.organization.currentOrganizationId,
    socket: state.apollo.socket,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ push }, dispatch)
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(
  withGql(NavDrawer, MENU_LABELS, props => ({ fetchPolicy: 'cache-first', name: 'allLabelsQuery' }))
))
