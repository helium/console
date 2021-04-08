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
    showMacInfo: false,
    showReq: false,
    showRes: false
  }

  toggleView = view => {
    this.setState({ [view]: !this.state[view] })
  }

  componentDidUpdate(prevProps) {
    const { expandAll } = this.props;

    if (prevProps.expandAll && !expandAll) {
      this.setState({
        showDeviceInfo: false,
        showHotspotInfo: false,
        showIntegrationInfo: false,
        showMacInfo: false,
        showReq: false,
        showRes: false
      });
    } else if (!prevProps.expandAll && expandAll) {
      this.setState({
        showEventInfo: true,
        showDeviceInfo: true,
        showHotspotInfo: true,
        showIntegrationInfo: true,
        showMacInfo: true,
        showReq: true,
        showRes: true
      });
    }
  }

  renderHeader = (category, subCategory) => {
    // to display category and subcategory in natural language
    const subCategoryMap = {
      uplink_integration_req: 'Integration request',
      uplink_integration_res: 'Integration response',
      uplink_dropped_late: 'Late',
      uplink_dropped_device_inactive: 'Device inactive',
      uplink_dropped_not_enough_dc: 'Insufficient DC',
      uplink_unconfirmed: 'Unconfirmed',
      uplink_confirmed: 'Confirmed',
      downlink_dropped_misc: 'Miscellaneous',
      downlink_dropped_payload_size_exceeded: 'Payload size exceeded',
      downlink_unconfirmed: 'Unconfirmed',
      downlink_confirmed: 'Confirmed',
      downlink_queued: 'Queued',
      downlink_ack: 'Acknowledge',
      misc_integration_error: 'Integration error',
    }
    return (
      <Text style={{ color: '#1890ff', fontSize: '18px', fontWeight: 'bold' }}>
        {category[0].toUpperCase() + category.substring(1).replace('_', ' ')}
        {subCategory !== "undefined" && `: 
          ${subCategoryMap[subCategory] ? 
            subCategoryMap[subCategory] : 
            subCategory[0].toUpperCase() + subCategory.substring(1).replace('_', ' ')
          }
        `}
      </Text>
    );
  }

  render() {
    const { event } = this.props
    const { showEventInfo, showDeviceInfo, showHotspotInfo, showIntegrationInfo, showMacInfo } = this.state
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
        <React.Fragment>
          {this.renderHeader(event.category, event.sub_category)}
        </React.Fragment>
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
          {
            event.data.mac && (
              <div style={{ marginBottom: 5 }}>
                { showMacInfo ? (
                  <EyeFilled
                    style={{ color: '#FFFFFF', marginRight: 10 }}
                    onClick={() => this.toggleView("showMacInfo")}
                  />
                ) : (
                  <EyeInvisibleFilled
                    style={{ color: '#8C8C8C', marginRight: 10 }}
                    onClick={() => this.toggleView("showMacInfo")}
                  />
                )}
                <Text style={{ color: showMacInfo ? '#FFFFFF' : '#8C8C8C' }}>MAC Command Information</Text>
              </div>
            )
          }
          {
            event.data.mac && this.state.showMacInfo && (
              <div style={{ marginTop: 20 }}>
              <pre style={{ color: debugTextColor }}>
                {JSON.stringify(event.data.mac, null, 2)}
              </pre>
              </div>
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
