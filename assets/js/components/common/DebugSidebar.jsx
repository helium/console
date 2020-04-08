import React, { Component } from 'react'
import { Subscription } from 'react-apollo';
import { debugSidebarBackgroundColor, debugTextColor } from '../../util/colors'
import { Typography } from 'antd';
const { Text } = Typography

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

    const event = subscriptionData.data.eventAdded
    const { data } = this.state
    if (data.length > 50) {
      data.pop()
    }
    this.setState({ data: [event].concat(data) })
  }

  render() {
    const { show, subscription, variables } = this.props
    const { data } = this.state

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
            top: 80,
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
              {() => (
                <div style={{ height: '100%', width: '100%', overflow: 'scroll'}}>
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
              )}
            </Subscription>
          )
        }
      </div>
    )
  }
}


export default DebugSidebar
