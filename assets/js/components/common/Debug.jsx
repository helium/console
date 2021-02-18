import React, { Component } from 'react'
import { connect } from 'react-redux'
import DebugEntry from './DebugEntry'
import omit from 'lodash/omit'
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

    const { socket } = this.props

    this.channel = socket.channel("graphql:label_show_debug", {})
    this.channel.join()
    this.channel.on(`graphql:label_show_debug:${this.props.labelId}:get_event`, (message) => {
      this.updateData(message)
    })
  }

  componentWillUnmount() {
    this.channel.leave()
  }

  clearSingleEntry = id => {
    this.setState({
      data: this.state.data.filter(d => d.id !== id)
    })
  }

  updateData = event => {
    if (this.state.data.length === 10) return
    if (!event.hasOwnProperty("payload")) return

    const hotspots = JSON.parse(event.hotspots)
    const channels = JSON.parse(event.channels)

    event.hotspots = hotspots || []
    if (channels) {
      event.channels = channels.map(channel => {
        if (channel.debug) {
          channel.debug = JSON.parse(channel["debug"])
          if (channel.debug.req && channel.debug.req.body) {
            try {
              channel.debug.req.body =  JSON.parse(channel.debug.req.body)
            } catch(e) {}
          }
          if (channel.debug.res && channel.debug.res.body) {
            try {
              channel.debug.res.body = JSON.parse(channel.debug.res.body)
            } catch(e) {}
          }
        }
        return channel
      })
    } else {
      event.channels = []
    }

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
            <span style={{ fontWeight: '500' }}>Displaying</span> <span style={{ fontWeight: '300' }}>{data.length} / 10 Packets</span>
          </Text>
          <Popover content="Debug mode only shows a limited amount of packets at once. Click refresh to see more." placement="bottom" overlayStyle={{ width: 220 }}>
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
                <DebugEntry data={d} clearSingleEntry={this.clearSingleEntry}/>
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
