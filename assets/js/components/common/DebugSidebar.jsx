import React, { Component } from 'react'
import { Subscription } from 'react-apollo';
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

    const event = subscriptionData.data[this.props.subscriptionKey]
    const { data } = this.state
    if (data.length > 9) {
      data.pop()
    }
    this.setState({ data: [event].concat(data) })
  }

  renderData = () => {
    const { data } = this.state

    if (data.length === 0) return (
      <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <img style={{ height: 22, width: 22, marginBottom: 5 }} className="rotate" src={Loader} />
        <Text code style={{ color: debugTextColor }}>
          Loading Debug Mode
        </Text>
      </div>
    )
    return (
      <div style={{ height: '100%', width: '100%', overflow: 'scroll'}}>
        <div style={{ width: '100%', backgroundColor: debugSidebarHeaderColor, padding: '25px 30px 25px 30px', display: 'flex', flexDirection: 'row', alignItems: 'center', position: 'absolute' }}>
          <Text style={{ color: 'white' }}>
            Displaying <span style={{ fontFamily: 'soleil-light' }}>{data.length} / 10 Payloads</span>
          </Text>
          <Popover content="Debug mode only shows a limited amount of payloads at once. Click refresh to see more." placement="bottom" overlayStyle={{ width: 220 }}>
            <Icon type="info-circle" style={{ color: 'white', fontSize: 18, marginLeft: 10 }}/>
          </Popover>
          <div style={{ flexGrow: 1 }}/>
          <Button
            type="primary"
            icon="reload"
            shape="circle"
            onClick={() => this.setState({ data: [] })}
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
          backgroundColor: debugSidebarBackgroundColor,
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
