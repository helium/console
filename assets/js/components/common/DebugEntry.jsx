import React, { Component } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard';
import moment from 'moment'
import { debugTextColor } from '../../util/colors'
import { displayInfo } from '../../util/messages'
import { Typography, Icon, Menu, Dropdown } from 'antd';
const { Text } = Typography

class DebugEntry extends Component {
  state = {
    show1: true,
    show2: false,
    show3: false,
    show4: false,
    channelView: {},
  }

  toggleView = view => {
    this.setState({ [view]: !this.state[view] })
  }

  render() {
    const { data } = this.props
    const { show1, show2, show3, show4 } = this.state
    const stringJSON = JSON.stringify(data, null, 2)

    const menu = (
      <Menu>
        <CopyToClipboard text={stringJSON}>
          <Menu.Item onClick={() => displayInfo("Copied to Clipboard")}>
            Copy Output to Clipboard
          </Menu.Item>
        </CopyToClipboard>
        <Menu.Item>
          <a
            href={`data:text/json;charset=utf-8,${encodeURIComponent(stringJSON)}`}
            download="event-debug.json"
          >
            Save JSON File
          </a>
        </Menu.Item>
        <Menu.Item style={{ color: '#F5222D'}} onClick={() => this.props.clearSingleEntry(data.id)}>
          Clear Entry
        </Menu.Item>
      </Menu>
    )

    return (
      <div key={data.id} style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 10, paddingBottom: 10, marginBottom: 10,  marginLeft: 25, width: 600, backgroundColor: '#353535', borderRadius: 10 }}>
        <div style={{ marginBottom: 5, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          <span>
            <Icon
              type={show1 ? "eye" : "eye-invisible"}
              theme="filled"
              style={{ color: show1 ? '#FFFFFF' : '#8C8C8C', marginRight: 10 }}
              onClick={() => this.toggleView("show1")}
            />
            <Text style={{ color: show1 ? '#FFFFFF' : '#8C8C8C' }}>Packet Information</Text>
          </span>

          <span style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: '#8C8C8C' }}>{moment.unix(data.reported_at).fromNow()}</Text>
            <Dropdown overlay={menu}>
              <Icon
                type="ellipsis"
                style={{ color: '#8C8C8C', marginLeft: 10, fontSize: 16 }}
              />
            </Dropdown>
          </span>
        </div>
        {
          this.state.show1 && (
            <div style={{ marginBottom: 20 }}>
              <pre style={{ color: debugTextColor }}>
                {JSON.stringify(
                    {
                      "id": data.id,
                      "category": data.category,
                      "description": data.description,
                      "fcnt_up": data.frame_up,
                      "fcnt_down": data.frame_down,
                      "payload": data.payload,
                      "payload_hex": data.payload_hex,
                      "payload_size": data.payload_size,
                      "port": data.port,
                      "reported_at": data.reported_at,
                    }, null, 2
                )}
              </pre>
            </div>
          )
        }
        <div style={{ marginBottom: 5 }}>
          <Icon
            type={show2 ? "eye" : "eye-invisible"}
            theme="filled"
            style={{ color: show2 ? '#FFFFFF' : '#8C8C8C', marginRight: 10 }}
            onClick={() => this.toggleView("show2")}
          />
          <Text style={{ color: show2 ? '#FFFFFF' : '#8C8C8C' }}>Device Information</Text>
        </div>
        {
          this.state.show2 && (
            <div style={{ marginBottom: 20 }}>
              <pre style={{ color: debugTextColor }}>
                {JSON.stringify(
                    {
                      "name": data.device_name,
                      "devaddr": data.devaddr,
                    }, null, 2
                )}
              </pre>
            </div>
          )
        }
        <div style={{ marginBottom: 5 }}>
          <Icon
            type={show3 ? "eye" : "eye-invisible"}
            theme="filled"
            style={{ color: show3 ? '#FFFFFF' : '#8C8C8C', marginRight: 10 }}
            onClick={() => this.toggleView("show3")}
          />
          <Text style={{ color: show3 ? '#FFFFFF' : '#8C8C8C' }}>Hotspots</Text>
        </div>
        {
          this.state.show3 && data.hotspots.map(h => (
            <div key={h.id} style={{ marginBottom: 20 }}>
              <pre style={{ color: debugTextColor }}>
                {JSON.stringify(h, null, 2)}
              </pre>
            </div>
          ))
        }
        <div style={{ marginBottom: 5 }}>
          <Icon
            type={show4 ? "eye" : "eye-invisible"}
            theme="filled"
            style={{ color: show4 ? '#FFFFFF' : '#8C8C8C', marginRight: 10 }}
            onClick={() => this.toggleView("show4")}
          />
          <Text style={{ color: show4 ? '#FFFFFF' : '#8C8C8C' }}>Integrations</Text>
        </div>
        {
          this.state.show4 && data.channels.map(c => (
            <div key={c.id} style={{ marginBottom: 20 }}>
              <span style={{ marginLeft: 25 }}>
                <Icon
                  type={this.state.channelView[c.id] && this.state.channelView[c.id].req ? "eye" : "eye-invisible"}
                  theme="filled"
                  style={{ color: this.state.channelView[c.id] && this.state.channelView[c.id].req ? "#FFFFFF" : '#8C8C8C', marginRight: 10 }}
                  onClick={() => {
                    if (this.state.channelView[c.id]) {
                      this.setState({
                        channelView: {
                          [c.id]: {
                            req: !this.state.channelView[c.id].req,
                            res: this.state.channelView[c.id].res,
                          }
                        }
                      })
                    } else {
                      this.setState({
                        channelView: {
                          [c.id]: {
                            req: true,
                            res: false,
                          }
                        }
                      })
                    }
                  }}
                />
                <Text style={{ color: this.state.channelView[c.id] && this.state.channelView[c.id].req ? "#FFFFFF" : '#8C8C8C' }}>Debug Request</Text>
              </span>
              <span style={{ marginLeft: 15 }}>
                <Icon
                  type={this.state.channelView[c.id] && this.state.channelView[c.id].res ? "eye" : "eye-invisible"}
                  theme="filled"
                  style={{ color: this.state.channelView[c.id] && this.state.channelView[c.id].res ? "#FFFFFF" : '#8C8C8C', marginRight: 10 }}
                  onClick={() => {
                    if (this.state.channelView[c.id]) {
                      this.setState({
                        channelView: {
                          [c.id]: {
                            req: this.state.channelView[c.id].req,
                            res: !this.state.channelView[c.id].res,
                          }
                        }
                      })
                    } else {
                      this.setState({
                        channelView: {
                          [c.id]: {
                            req: false,
                            res: true,
                          }
                        }
                      })
                    }
                  }}
                />
                <Text style={{ color: this.state.channelView[c.id] && this.state.channelView[c.id].res ? "#FFFFFF" : '#8C8C8C' }}>Debug Response</Text>
              </span>
              <pre style={{ color: debugTextColor, marginLeft: 25 }}>
                {JSON.stringify(
                    {
                      "id": c.id,
                      "name": c.name,
                      "description": c.description,
                      "status": c.status,
                      "decoded_payload": c.debug && c.debug.req && c.debug.req.body.decoded && c.debug.req.body.decoded.payload
                    }, null, 2
                )}
              </pre>
              <div style={{ marginLeft: 50 }}>
                {
                  this.state.channelView[c.id] && this.state.channelView[c.id].req && (
                    <pre style={{ color: debugTextColor }}>
                      {JSON.stringify(
                          c.debug.req, null, 2
                      )}
                    </pre>
                  )
                }
                {
                  this.state.channelView[c.id] && this.state.channelView[c.id].res && (
                    <pre style={{ color: debugTextColor }}>
                      {JSON.stringify(
                          c.debug.res, null, 2
                      )}
                    </pre>
                  )
                }
              </div>
            </div>
          ))
        }
      </div>
    )
  }
}

const TextRow = ({ title, value }) => (
  <div>
    <span style={{ backgroundColor: debugTextColor, padding: '1px 7px 1px 7px', borderRadius: 5 }}>
      <Text style={{ color: '#1D1D1D', fontFamily: 'monospace' }}>{title}</Text>
    </span>
    <span style={{ padding: '1px 7px 1px 7px' }}>
      <Text style={{ color: debugTextColor, fontFamily: 'monospace' }}>{value}</Text>
    </span>
  </div>
)

const chunkArray = (array, chunkSize) => {
  return Array.from({ length: Math.ceil(array.length / chunkSize) }, (_, index) =>
    array.slice(index * chunkSize, (index + 1) * chunkSize)
  )
}

export default DebugEntry
