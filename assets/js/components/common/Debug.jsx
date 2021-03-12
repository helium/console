import React, { Component } from 'react'
import { connect } from 'react-redux'
import DebugEntry from './DebugEntry'
import { debugSidebarHeaderColor, debugTextColor } from '../../util/colors'
import { Typography, Popover, Button } from 'antd';
import { InfoCircleOutlined, ReloadOutlined } from '@ant-design/icons';
const { Text } = Typography
import Loader from '../../../img/debug-loader.png'

class Debug extends Component {
  state = {
    data: []
  }

  componentDidMount() {
    this.setState({ data: []})

    const { socket, deviceId, labelId } = this.props

    if (deviceId) {
      this.channel = socket.channel("graphql:device_show_debug", {})
      this.channel.join()
      this.channel.on(`graphql:device_show_debug:${this.props.deviceId}:get_event`, (message) => {
        this.updateData(message)
      })
    }
    if (labelId) {
      this.channel = socket.channel("graphql:label_show_debug", {})
      this.channel.join()
      this.channel.on(`graphql:label_show_debug:${this.props.labelId}:get_event`, (message) => {
        this.updateData(message)
      })
    }
  }

  componentWillUnmount() {
    this.channel.leave()
  }

  clearSingleEntry = id => {
    this.setState({
      data: this.state.data.filter(d => d.id !== id)
    })
  }

  getUniqueRouterUuids = () => (
    [...new Set(this.state.data.map(e => e.router_uuid))]
  )

  updateData = event => {
    // since events come in deaggregated from router, limit to 10 unique router_uuids (incl. all its related events)
    const uniqueRouterUuids = this.getUniqueRouterUuids()
    if (!uniqueRouterUuids.includes(event.router_uuid) && uniqueRouterUuids.length === 10) return

    const { data } = this.state
    this.setState({ data: [event].concat(data) })
  }

  render = () => {
    const { data } = this.state

    if (data.length === 0) return (
      <div style={{ height: 'calc(100% - 55px)', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <img style={{ height: 22, width: 22, marginBottom: 5 }} className="rotate" src={Loader} />
        <Text style={{ color: debugTextColor }}>
          Waiting for data...
        </Text>
      </div>
    )
    return (
      <div style={{ height: 'calc(100% - 55px)', width: '100%', overflow: 'scroll'}} className="no-scroll-bar">
        <div style={{ width: '100%', backgroundColor: debugSidebarHeaderColor, padding: '25px 30px 25px 30px', display: 'flex', flexDirection: 'row', alignItems: 'center', position: 'absolute', top: 0 }}>
          <Text style={{ color: 'white' }}>
            <span style={{ fontWeight: '500' }}>Displaying</span> <span style={{ fontWeight: '300' }}>{data.length} / 40 Events</span>
          </Text>
          <Popover content="Debug mode only shows a limited amount of events at once. Click refresh to see more." placement="bottom" overlayStyle={{ width: 220 }}>
            <InfoCircleOutlined style={{ color: 'white', fontSize: 18, marginLeft: 10 }}/>
          </Popover>
          <div style={{ flexGrow: 1 }}/>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            shape="circle"
            onClick={() => {
              this.setState({ data: [] })
              this.props.refresh()
            }}
          />
        </div>
        <div style={{ width: "100%", marginTop: 50 }}>
          {
            data.map(d => (
              <span key={d.id}>
                <DebugEntry event={d} clearSingleEntry={this.clearSingleEntry}/>
              </span>
            ))
          }
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {
    socket: state.apollo.socket,
  }
}

export default connect(mapStateToProps, null)(Debug)
