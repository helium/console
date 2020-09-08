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
    data: [{
      "channels": [
        {
          "debug": {
            "req": {
              "body": {
                "app_eui": "599A6842847C8AFA",
                "dc": {
                  "balance": 2428039,
                  "nonce": 2
                },
                "decoded": {
                  "payload": [
                    {
                      "channel": 1,
                      "name": "temperature",
                      "type": 103,
                      "unit": "celcius",
                      "value": 33.5
                    },
                    {
                      "channel": 2,
                      "name": "humidity",
                      "type": 104,
                      "unit": "hPa",
                      "value": 1017.3
                    },
                    {
                      "channel": 3,
                      "name": "humidity",
                      "type": 104,
                      "unit": "percent",
                      "value": 49
                    }
                  ],
                  "status": "success"
                },
                "dev_eui": "B8DBAB2503899F96",
                "devaddr": "97000048",
                "downlink_url": "https://console.helium.com/api/v1/down/246ad734-d079-4b4f-a35f-ded7fa40f774/lssrzrKql33CXamI6_okeHYgZ2X6jbz6/aa771214-6f86-417e-91c7-6c55944076f4",
                "fcnt": 661,
                "hotspots": [
                  {
                    "channel": 14,
                    "frequency": 905.0999755859375,
                    "id": "11dqsvj1yzKUPeKZx5FJfdhTXjvuMBRHq1TZu7LWo3Ju7y7itKt",
                    "lat": 40.71297764919533,
                    "long": -73.8154828026935,
                    "name": "bouncy-seaweed-bird",
                    "reported_at": 1599603699,
                    "rssi": -48,
                    "snr": 14.199999809265137,
                    "spreading": "SF10BW125",
                    "status": "success"
                  }
                ],
                "id": "aa771214-6f86-417e-91c7-6c55944076f4",
                "metadata": {
                  "labels": [
                    {
                      "id": "4e3734eb-4cad-4295-91f8-516b7d83bda4",
                      "name": "Cayenne",
                      "organization_id": "bf62621a-a89d-4c87-9236-2ea5d09f918c"
                    },
                    {
                      "id": "ab39dcf9-3ad3-4727-a80a-7df6c6ccd155",
                      "name": "AWSIOT",
                      "organization_id": "bf62621a-a89d-4c87-9236-2ea5d09f918c"
                    },
                    {
                      "id": "bc5c6f1c-2b5a-487c-8e77-de7c50b1dcb7",
                      "name": "GoogleSheets",
                      "organization_id": "bf62621a-a89d-4c87-9236-2ea5d09f918c"
                    }
                  ],
                  "organization_id": "bf62621a-a89d-4c87-9236-2ea5d09f918c"
                },
                "name": "The Alchemist Machine",
                "payload": "AWcBTwJzJ70DaGI=",
                "port": 1,
                "reported_at": 1599603699
              },
              "headers": {
                "Content-Type": "application/json"
              },
              "method": "post",
              "url": "https://enj8vwrwuw17w1e.m.pipedream.net"
            },
            "res": {
              "body": "<p><b>Success!</b></p>\n<p>To customize this response, check out our docs <a href=\"https://docs.pipedream.com/workflows/steps/triggers/#customizing-the-http-response\">here</a></p>\n",
              "code": 200,
              "headers": {
                "Access-Control-Allow-Origin": "*",
                "Connection": "keep-alive",
                "Content-Length": "179",
                "Content-Type": "text/html; charset=UTF-8",
                "Date": "Tue, 08 Sep 2020 22:21:40 GMT",
                "ETag": "W/\"b3-17408e08530\"",
                "X-Powered-By": "Express",
                "x-pd-status": "sent to coordinator"
              }
            }
          },
          "description": "<p><b>Success!</b></p>\n<p>To customize this response, check out our docs <a href=\"https://docs.pipedream.com/workflows/steps/triggers/#customizing-the-http-response\">here</a></p>\n",
          "id": "246ad734-d079-4b4f-a35f-ded7fa40f774",
          "name": "Environmental Sensors",
          "status": "success"
        },
        {
          "debug": {
            "req": {
              "body": {
                "app_eui": "599A6842847C8AFA",
                "dc": {
                  "balance": 2428039,
                  "nonce": 2
                },
                "dev_eui": "B8DBAB2503899F96",
                "devaddr": "97000048",
                "downlink_url": "https://console.helium.com/api/v1/down/a1f302b4-d91d-4c3f-a30f-34692a79b7b1/Gs-N-1iUjrzzIGNCJx-nBLnt0B-pHBMz/aa771214-6f86-417e-91c7-6c55944076f4",
                "fcnt": 661,
                "hotspots": [
                  {
                    "channel": 14,
                    "frequency": 905.0999755859375,
                    "id": "11dqsvj1yzKUPeKZx5FJfdhTXjvuMBRHq1TZu7LWo3Ju7y7itKt",
                    "lat": 40.71297764919533,
                    "long": -73.8154828026935,
                    "name": "bouncy-seaweed-bird",
                    "reported_at": 1599603699,
                    "rssi": -48,
                    "snr": 14.199999809265137,
                    "spreading": "SF10BW125",
                    "status": "success"
                  }
                ],
                "id": "aa771214-6f86-417e-91c7-6c55944076f4",
                "metadata": {
                  "labels": [
                    {
                      "id": "4e3734eb-4cad-4295-91f8-516b7d83bda4",
                      "name": "Cayenne",
                      "organization_id": "bf62621a-a89d-4c87-9236-2ea5d09f918c"
                    },
                    {
                      "id": "ab39dcf9-3ad3-4727-a80a-7df6c6ccd155",
                      "name": "AWSIOT",
                      "organization_id": "bf62621a-a89d-4c87-9236-2ea5d09f918c"
                    },
                    {
                      "id": "bc5c6f1c-2b5a-487c-8e77-de7c50b1dcb7",
                      "name": "GoogleSheets",
                      "organization_id": "bf62621a-a89d-4c87-9236-2ea5d09f918c"
                    }
                  ],
                  "organization_id": "bf62621a-a89d-4c87-9236-2ea5d09f918c"
                },
                "name": "The Alchemist Machine",
                "payload": "AWcBTwJzJ70DaGI=",
                "port": 1,
                "reported_at": 1599603699
              },
              "headers": {
                "Content-Type": "application/json"
              },
              "method": "post",
              "url": "https://lora.mydevices.com/v1/networks/helium/uplink"
            },
            "res": {
              "body": "",
              "code": 202,
              "headers": {
                "Connection": "keep-alive",
                "Content-Length": "0",
                "Date": "Tue, 08 Sep 2020 22:21:40 GMT",
                "cache-control": "no-cache",
                "vary": "origin"
              }
            }
          },
          "description": "Connection established",
          "id": "a1f302b4-d91d-4c3f-a30f-34692a79b7b1",
          "name": "New Cayenne",
          "status": "success"
        }
      ],
      "devaddr": "97000048",
      "device_name": "The Alchemist Machine",
      "frame_down": 1,
      "frame_up": 661,
      "hotspots": [
        {
          "frequency": 905.0999755859375,
          "id": "11dqsvj1yzKUPeKZx5FJfdhTXjvuMBRHq1TZu7LWo3Ju7y7itKt",
          "name": "bouncy-seaweed-bird",
          "rssi": -48,
          "snr": 14.199999809265137,
          "spreading": "SF10BW125"
        }
      ],
      "id": "18d92625-09c5-4b80-a93f-eca1e5b42c51",
      "payload": "AWcBTwJzJ70DaGI=",
      "payload_size": 11,
      "port": 1
    }]
  }

  componentDidMount = () => {
    // this.setState({ data: []})
  }

  clearSingleEntry = id => {
    this.setState({
      data: this.state.data.filter(d => d.id !== id)
    })
  }

  updateData = subscriptionData => {
    if (this.state.data.length === 10) return

    let event = subscriptionData.data[this.props.subscriptionKey]

    if (!event.hasOwnProperty("payload")) return

    event = omit(event, ["__typename"])
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
                <DebugEntry data={d} clearSingleEntry={this.clearSingleEntry}/>
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
