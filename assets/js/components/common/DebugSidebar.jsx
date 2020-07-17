import React, { Component } from 'react'
import { Subscription } from 'react-apollo';
import omit from 'lodash/omit'
import { debugSidebarBackgroundColor, debugSidebarHeaderColor, debugTextColor } from '../../util/colors'
import { Typography, Icon, Popover, Button } from 'antd';
const { Text } = Typography
import Loader from '../../../img/debug-loader.png'

class DebugSidebar extends Component {
  state = {
    data: []
  }

  handleToggle = () => {
    const { toggle, show } = this.props
    if (show) this.setState({ data: [] })
    toggle()
  }

  updateData = subscriptionData => {
    if (!this.props.show) return
    if (this.state.data.length === 10) return

    let event = subscriptionData.data[this.props.subscriptionKey]

    if (!event.hasOwnProperty("payload")) return

    event = omit(event, ["__typename", "category", "description", "reported_at"])
    if (event.hotspots && event.hotspots.length > 0) event.hotspots = event.hotspots.map(h => omit(h, ["__typename"]))
    if (event.channels && event.hotspots.length > 0) {
      event.channels = event.channels.map(c => {
        const channel = omit(c, ["__typename"])
        if (channel.debug) {
          channel.debug = JSON.parse(c["debug"])
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
    }

    const { data } = this.state
    this.setState({ data: [event].concat(data) })
  }

  renderData = () => {
    const { data } = this.state

    if (data.length === 0) return (
      <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <img style={{ height: 22, width: 22, marginBottom: 5 }} className="rotate" src={Loader} />
        <Text style={{ color: debugTextColor }}>
          Waiting for data...
        </Text>
      </div>
    )
    return (
      <div style={{ height: '100%', width: '100%', overflow: 'scroll'}} className="no-scroll-bar">
        <div style={{ width: '100%', backgroundColor: debugSidebarHeaderColor, padding: '25px 30px 25px 30px', display: 'flex', flexDirection: 'row', alignItems: 'center', position: 'absolute' }}>
          <Text style={{ color: 'white' }}>
            <span style={{ fontWeight: '500' }}>Displaying</span> <span style={{ fontWeight: '300' }}>{data.length} / 10 Packets</span>
          </Text>
          <Popover content="Debug mode only shows a limited amount of packets at once. Click refresh to see more." placement="bottom" overlayStyle={{ width: 220 }}>
            <Icon type="info-circle" style={{ color: 'white', fontSize: 18, marginLeft: 10 }}/>
          </Popover>
          <div style={{ flexGrow: 1 }}/>
          <Button
            type="primary"
            icon="reload"
            shape="circle"
            onClick={() => {
              this.setState({ data: [] })
              this.props.refresh()
            }}
          />
        </div>
        <div style={{ width: "100%", marginTop: 85 }}>
          {
            data.map(d => (
              <div key={d.id} style={{ paddingLeft: 20, paddingRight: 20, width: '100%' }}>
                <Text code style={{ color: debugTextColor, marginBottom: 10 }}>
                  <pre>
                    {JSON.stringify(d, null, 2)}
                  </pre>
                </Text>
              </div>
            ))
          }
        </div>
      </div>
    )
  }

  render() {
    const { show, subscription, variables } = this.props

    return (
      <div
        style={{
          background: debugSidebarBackgroundColor,
          position: 'absolute',
          top: 64,
          width: show ? 500 : 0,
          height: 'calc(100vh - 64px)',
          right: 0,
          zIndex: 10,
          padding: 0,
          transition: 'all 0.5s ease',
        }}
      >
        <div
          style={{
            transform: 'rotate(-90deg)',
            position: 'absolute',
            left: -52,
            top: 160,
            backgroundColor: debugSidebarBackgroundColor,
            paddingLeft: 12,
            paddingRight: 12,
            paddingTop: 6,
            paddingBottom: 10,
            borderRadius: '10px 10px 0px 0px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
          onClick={this.handleToggle}
        >
          <Text style={{ color: 'white' }}>Debug</Text>
        </div>
        {
          show && (
            <Subscription
              subscription={subscription}
              variables={variables}
              onSubscriptionData={({ subscriptionData }) => this.updateData(subscriptionData)}
              fetchPolicy="network-only"
              shouldResubscribe
            >
              {this.renderData}
            </Subscription>
          )
        }
      </div>
    )
  }
}


export default DebugSidebar
