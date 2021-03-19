import React, { Component } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard';
import moment from 'moment'
import { debugTextColor } from '../../util/colors'
import { displayInfo } from '../../util/messages'
import { Typography, Menu, Dropdown } from 'antd';
import { EyeFilled, EyeInvisibleFilled, EllipsisOutlined } from '@ant-design/icons';
import { Icon } from '@ant-design/compatible';
const { Text } = Typography

class DebugEntry extends Component {
  state = {
    showEventInfo: true,
    showDeviceInfo: false,
    showHotspotInfo: false,
    showIntegrationInfo: false,
    showReq: false,
    showRes: false
  }

  toggleView = view => {
    this.setState({ [view]: !this.state[view] })
  }

  render() {
    const { event } = this.props
    const { showEventInfo, showDeviceInfo, showHotspotInfo, showIntegrationInfo } = this.state
    const stringJSON = JSON.stringify(event, null, 2)

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
        <Menu.Item style={{ color: '#F5222D'}} onClick={() => this.props.clearSingleEntry(event.id)}>
          Clear Entry
        </Menu.Item>
      </Menu>
    )

    return (
      <div key={event.id} style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 10, paddingBottom: 10, marginBottom: 10,  marginLeft: 25, width: 600, backgroundColor: '#353535', borderRadius: 10 }}>
        <div style={{ marginBottom: 5, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          <span>
            {
              showEventInfo ? (
                <EyeFilled
                  style={{ color: '#FFFFFF', marginRight: 10 }}
                  onClick={() => this.toggleView("showEventInfo")}
                />
              ) : (
                <EyeInvisibleFilled
                  style={{ color: '#8C8C8C', marginRight: 10 }}
                  onClick={() => this.toggleView("showEventInfo")}
                />
              )
            }
            <Text style={{ color: showEventInfo ? '#FFFFFF' : '#8C8C8C' }}>Event Information</Text>
          </span>

          <span style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: '#8C8C8C' }}>{moment(parseInt(event.reported_at)).fromNow()}</Text>
            <Dropdown overlay={menu}>
              <EllipsisOutlined style={{ color: '#8C8C8C', marginLeft: 10, fontSize: 16 }} />
            </Dropdown>
          </span>
        </div>
        {
          this.state.showEventInfo && (
            <div style={{ marginBottom: 20 }}>
              <pre style={{ color: debugTextColor }}>
                {JSON.stringify(
                    {
                      "id": event.id,
                      "router_uuid": event.router_uuid,
                      "category": event.category,
                      "sub_category": event.sub_category,
                      "description": event.description,
                      ...(event.category === 'uplink' && {"fcnt_up": event.data.fcnt}),
                      ...(event.category === 'downlink' && {"fcnt_down": event.data.fcnt}),
                      "payload": event.data.payload,
                      "payload_size": event.data.payload_size,
                      "port": event.data.port,
                      "reported_at": event.reported_at,
                    }, null, 2
                )}
              </pre>
            </div>
          )
        }
        {
          event.device_name && 
            <div style={{ marginBottom: 5 }}>
              { showDeviceInfo ? (
                <EyeFilled
                  style={{ color: '#FFFFFF', marginRight: 10 }}
                  onClick={() => this.toggleView("showDeviceInfo")}
                />
              ) : (
                <EyeInvisibleFilled
                  style={{ color: '#8C8C8C', marginRight: 10 }}
                  onClick={() => this.toggleView("showDeviceInfo")}
                />
              )}
              <Text style={{ color: showDeviceInfo ? '#FFFFFF' : '#8C8C8C' }}>Device Information</Text>
            </div>
        }
        {
          this.state.showDeviceInfo && (
            <div style={{ marginBottom: 20 }}>
              <pre style={{ color: debugTextColor }}>
                {JSON.stringify(
                    {
                      "name": event.device_name,
                      "devaddr": event.data.devaddr,
                    }, null, 2
                )}
              </pre>
            </div>
          )
        }
        {
          event.data && event.data.hotspot &&
            <div style={{ marginBottom: 5 }}>
              {
                showHotspotInfo ? (
                  <EyeFilled
                    style={{ color: '#FFFFFF', marginRight: 10 }}
                    onClick={() => this.toggleView("showHotspotInfo")}
                  />
                ) : (
                  <EyeInvisibleFilled
                    style={{ color: '#8C8C8C', marginRight: 10 }}
                    onClick={() => this.toggleView("showHotspotInfo")}
                  />
                )
              }
              <Text style={{ color: showHotspotInfo ? '#FFFFFF' : '#8C8C8C' }}>Hotspot</Text>
            </div>
        }
        {
          this.state.showHotspotInfo && 
            <div style={{ marginBottom: 20 }}>
              <pre style={{ color: debugTextColor }}>
                {JSON.stringify(event.data.hotspot, null, 2)}
              </pre>
            </div>
        }
        {
          event.data && event.data.integration &&
            <div style={{ marginBottom: 5 }}>
            {
              showIntegrationInfo ? (
                <EyeFilled
                  style={{ color: '#FFFFFF', marginRight: 10 }}
                  onClick={() => this.toggleView("showIntegrationInfo")}
                />
              ) : (
                <EyeInvisibleFilled
                  style={{ color: '#8C8C8C', marginRight: 10 }}
                  onClick={() => this.toggleView("showIntegrationInfo")}
                />
              )
            }
            <Text style={{ color: showIntegrationInfo ? '#FFFFFF' : '#8C8C8C' }}>Integration</Text>
          </div>
        }
        <div style={{ marginBottom: 20 }}>
          {
            event.data.req && (
              <span style={{ marginLeft: 25 }}>
                <Icon
                  type={this.state.showReq ? "eye" : "eye-invisible"}
                  theme="filled"
                  style={{ color: this.state.showReq ? "#FFFFFF" : '#8C8C8C', marginRight: 10 }}
                  onClick={() => { this.setState({ showReq: !this.state.showReq }) }}
                />
                <Text style={{ color: this.state.showReq ? "#FFFFFF" : '#8C8C8C' }}>Debug Request</Text>
              </span>
            )
          }
          {
            event.data.res && (
              <span style={{ marginLeft: 15 }}>
                <Icon
                  type={this.state.showRes ? "eye" : "eye-invisible"}
                  theme="filled"
                  style={{ color: this.state.showRes ? "#FFFFFF" : '#8C8C8C', marginRight: 10 }}
                  onClick={() => { this.setState({ showRes: !this.state.showRes }) }}
                />
                <Text style={{ color: this.state.showRes ? "#FFFFFF" : '#8C8C8C' }}>Debug Response</Text>
              </span>
            )
          }
          {
            event.data.integration && this.state.showIntegrationInfo && (
              <React.Fragment>
              <pre style={{ color: debugTextColor, marginLeft: 25 }}>
                {JSON.stringify(
                    {
                      "id": event.data.integration.id,
                      "name": event.data.integration.name,
                      "status": event.data.integration.status,
                      "decoded_payload": event.data.req && event.data.req.body && event.data.req.body.decoded && event.data.req.body.decoded.payload
                    }, null, 2
                )}
              </pre>
              <div style={{ marginLeft: 50 }}>
                {
                  this.state.showReq && (
                    <pre style={{ color: debugTextColor }}>
                      {JSON.stringify(
                          event.data.req, null, 2
                      )}
                    </pre>
                  )
                }
                {
                  this.state.showRes && (
                    <pre style={{ color: debugTextColor }}>
                      {JSON.stringify(
                          event.data.res, null, 2
                      )}
                    </pre>
                  )
                }
              </div>
              </React.Fragment>
            )
          }
        </div>
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
