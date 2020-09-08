import React, { Component } from 'react'
import { Subscription } from 'react-apollo';
import DebugEntry from './DebugEntry'
import omit from 'lodash/omit'
import { debugSidebarHeaderColor, debugTextColor } from '../../util/colors'
import { Typography, Icon, Popover, Button } from 'antd';
const { Text } = Typography
import Loader from '../../../img/debug-loader.png'

class Debug extends Component {
  state = {
    data: [
      {
        "channels": [
          {
            "debug": {
              "req": {
                "body": {
                  "app_eui": "DC10DEE2C0381F05",
                  "dev_eui": "73BA0F7B47FCB3F6",
                  "devaddr": "E2DE10DC",
                  "fcnt": 9753,
                  "hotspots": [
                    {
                      "frequency": 913.0999755859375,
                      "id": "11tkAbgqHU2qU7GTiuwjggEDaYsmRDsbPsJjw5ezsu54coQE7Cu",
                      "name": "fancy-fossilized-moose",
                      "reported_at": 1586977541,
                      "rssi": -64,
                      "snr": 12,
                      "spreading": "SF9BW125",
                      "status": "success"
                    }
                  ],
                  "id": "a9bccdd2-ff89-47d0-b60f-8f01634c195f",
                  "metadata": {
                    "labels": [
                      {
                        "id": "aae7f89c-b6e8-49e8-9ea4-7e1109f54d87",
                        "name": "RequestBin",
                        "organization_id": "847e51db-25bd-4ff5-8fc3-33b459a68a22"
                      }
                    ]
                  },
                  "name": "Pierre-Test-Device",
                  "payload": "SGVsbG8sIHdvcmxkIQ==",
                  "port": 1,
                  "reported_at": 1586977541
                },
                "headers": {
                  "Content-Type": "application/json"
                },
                "method": "post",
                "url": "https://enssngw32yjbk.x.pipedream.net/"
              }
            },
            "description": "what happened",
            "id": "uuid2",
            "name": "channel name",
            "status": "success"
          }
        ],
        "devaddr": "yes",
        "device_name": "asdf",
        "frame_down": 10,
        "frame_up": 2,
        "hotspots": [
          {
            "frequency": 923.3,
            "id": "hotspot_id2",
            "name": "hotspot name",
            "rssi": -30,
            "snr": 0.2,
            "spreading": "SF9BW125"
          }
        ],
        "id": "8151a374-fb76-466c-8a2c-363fb16d5118",
        "payload": "payload",
        "payload_size": 2,
        "port": 12
      }
    ]
  }

  componentDidMount = () => {
    // this.setState({ data: []})
  }

  updateData = subscriptionData => {
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
        <div style={{ width: "100%", marginTop: 50 }}>
          {
            data.map(d => (
              <span key={d.id}>
                <DebugEntry data={data} />
              </span>
            ))
          }
        </div>
      </div>
    )
  }

  render() {
    const { subscription, variables } = this.props

    return (
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
}


export default Debug
