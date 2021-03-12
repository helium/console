import React, { Component } from 'react'
import { connect } from 'react-redux'
import { formatDatetime, getDiffInSeconds } from '../../util/time'
import analyticsLogger from '../../util/analyticsLogger';
import groupBy from 'lodash/groupBy';
import sortBy from 'lodash/sortBy';
import PacketGraph from '../common/PacketGraph'
import { DEVICE_EVENTS } from '../../graphql/events'
import withGql from '../../graphql/withGql'
import { Badge, Card, Col, Row, Typography, Table, Tag, Popover, Button, Checkbox } from 'antd';
import { CaretDownOutlined, CaretUpOutlined, CheckOutlined, InfoOutlined, CloseOutlined } from '@ant-design/icons';
const { Text } = Typography
import { SkeletonLayout } from '../common/SkeletonLayout';

const styles = {
  tag: {
    borderRadius: 9999,
    paddingBottom: 0,
    paddingRight: 9,
    fontSize: 14
  }
}

//https://stackoverflow.com/questions/39460182/decode-base64-to-hexadecimal-string-with-javascript
const base64ToHex = str => {
  const raw = atob(str);
  let result = '';
  for (let i = 0; i < raw.length; i++) {
    const hex = raw.charCodeAt(i).toString(16);
    result += (hex.length === 2 ? hex : '0' + hex);
  }
  return result.toUpperCase();
}

const categoryTag = (category, subCategories) => {
  switch(category) {
    case "uplink":
      if (subCategories.includes('uplink_dropped')) return <Text>Uplink Dropped</Text>;
      return <Text>Uplink</Text>
    case "downlink":
      if (subCategories.includes('downlink_dropped')) {
        return <Text>Downlink Dropped</Text>;
      } else if (subCategories.includes('downlink_ack')) {
        return <Text>Acknowledge</Text>;
      } else {
        return <Text>Downlink</Text>;
      }
    case "join_request":
      return <Text>Join Request</Text>
    case "join_accept":
      return <Text>Join Accept</Text>
    case "misc":
      return <Text>Misc. Integration Error</Text>
  }
}

const statusBadge = (status) => {
  switch(status) {
    case "error":
      return <Badge status="error" />
    case "success":
      return <Badge status="success" />
    default:
      return <Badge status="default" />
  }
}

class EventsDashboard extends Component {
  state = {
    rows: [],
    expandedRowKeys: [],
    expandAll: false,
  }

  componentDidUpdate(prevProps) {
    const { deviceEvents, loading } = this.props.deviceEventsQuery
    const { socket } = this.props

    if (prevProps.deviceEventsQuery.loading && !loading) {
      this.setState({ rows: deviceEvents }, () => {
        this.channel = socket.channel("graphql:events_dashboard", {})
        this.channel.join()
        this.channel.on(`graphql:events_dashboard:${this.props.device_id}:new_event`, (message) => {
          this.addEvent(message)
        })
      })
    }
  }

  componentWillUnmount() {
    this.channel.leave()
  }

  addEvent = event => {
    const { rows, expandAll } = this.state
    const lastEvent = rows[rows.length - 1]
    if (rows.length > 100 && getDiffInSeconds(parseInt(lastEvent.reported_at)) > 300) {
      rows.pop()
    }

    const expandedRowKeys = expandAll ? this.state.expandedRowKeys.concat(event.id) : this.state.expandedRowKeys

    this.setState({
      rows: [event].concat(rows),
      expandedRowKeys
    })
  }

  toggleExpandAll = (aggregatedRows) => {
    if (this.state.expandAll) {
      this.setState({ expandAll: false, expandedRowKeys: [] })
    } else {
      this.setState({ expandAll: true, expandedRowKeys: aggregatedRows.map(r => r.id) })
    }
  }

  onExpandRow = (expandRow, row) => {
    if (expandRow) {
      this.setState({ expandedRowKeys: this.state.expandedRowKeys.concat(row.id) })
    } else {
      this.setState({ expandAll: false, expandedRowKeys: this.state.expandedRowKeys.filter(id => id != row.id) })
    }
  }

  renderExpanded = record => {
    let hotspotColumns;
    if (record.category === 'downlink') {
      hotspotColumns = [
        { title: 'Hotspot Name', dataIndex: 'name' },
        { title: 'Frequency', dataIndex: 'frequency', render: data => <span>{(Math.round(data * 100) / 100).toFixed(2)}</span> },
        { title: 'Spreading', dataIndex: 'spreading' },
        { title: 'Time', dataIndex: 'time', render: data => <Text style={{textAlign:'left'}}>{formatDatetime(data)}</Text>}
      ]
    } else {
      hotspotColumns = [
        { title: 'Hotspot Name', dataIndex: 'name' },
        { title: 'RSSI', dataIndex: 'rssi'},
        { title: 'SNR', dataIndex: 'snr', render: data => <span>{(Math.round(data * 100) / 100).toFixed(2)}</span> },
        { title: 'Frequency', dataIndex: 'frequency', render: data => <span>{(Math.round(data * 100) / 100).toFixed(2)}</span> },
        { title: 'Spreading', dataIndex: 'spreading' },
        { title: 'Time', dataIndex: 'time', render: data => <Text style={{textAlign:'left'}}>{formatDatetime(data)}</Text>}
      ]
    }

    const lorawanColumns = [
      { title: 'Payload Size', dataIndex: 'payload_size' },
      { title: 'Port', dataIndex: 'port' },
      { title: 'Devaddr', dataIndex: 'devaddr' }
    ];

    const channelColumns = [
      { title: 'Integration Name', dataIndex: 'name' },
      { title: 'Status', render: (data, record) => <Text>{statusBadge(record.status)}{record.status}</Text> }
    ];

    return (
      <Row gutter={10}>
        <Col span={22}>
          <Card  bodyStyle={{padding: 0}}>
            <Table columns={lorawanColumns} dataSource={[record]} pagination={false} rowKey={record => record.id}/>
          </Card>
          <Card  bodyStyle={{padding: 0}}>
            <Table columns={hotspotColumns} dataSource={record.hotspots} pagination={false} rowKey={record => record.id}/>
          </Card>
          <Card  bodyStyle={{padding: 0}}>
            <Table columns={channelColumns} dataSource={record.integrations} pagination={false} rowKey={record => record.id}/>
          </Card>
        </Col>
      </Row>
    )
  }

  renderFrameIcons = row => {
    switch(row.category) {
      case "uplink":
        // per router, uplink_dropped will never be associated to another subcategory of uplink
        if (row.sub_categories.includes('uplink_dropped')) {
          return (
            <span>
              <Tag style={styles.tag} color="#D9D9D9">
                <CloseOutlined style={{ fontSize: 16, marginRight: 3, position: 'relative', top: 1.5 }} />
                {row.fct}
              </Tag>
              <Popover
                content={row.description}
                placement="top"
                overlayStyle={{ width: 220 }}
              >
                <Tag style={{ ...styles.tag, paddingRight: 0, cursor: "pointer" }} color="#D9D9D9">
                  <InfoOutlined style={{ marginLeft: -4, marginRight: 3 }} />
                </Tag>
              </Popover>
            </span>
          );
        } else {
          return (
            <Tag style={styles.tag} color="#4091F7">
              <CaretUpOutlined style={{ marginRight: 1 }}/>
              {row.fct}
            </Tag>
          )
        }
      case "downlink":
        // per router, downlink_dropped will never be associated to another subcategory of downlink
        if (row.sub_categories.includes('downlink_dropped')) {
          return (
            <span>
              <Tag style={styles.tag} color="#D9D9D9">
                <CloseOutlined style={{ fontSize: 16, marginRight: 3, position: 'relative', top: 1.5 }} />
                {row.fct}
              </Tag>
              <Popover
                content={row.description}
                placement="top"
                overlayStyle={{ width: 220 }}
              >
                <Tag style={{ ...styles.tag, paddingRight: 0, cursor: "pointer" }} color="#D9D9D9">
                  <InfoOutlined style={{ marginLeft: -4, marginRight: 3 }} />
                </Tag>
              </Popover>
            </span>
          );
        } else {
          return (
            <Tag style={styles.tag} color="#FA541C">
              <CaretDownOutlined style={{ marginRight: 1 }}/>
              {row.fct}
            </Tag>
          );
        }
      case "join_request":
      case "join_accept":
        return (
          <Tag style={styles.tag} color="#4091F7">
            <CheckOutlined style={{ fontSize: 12, marginRight: 3 }} />
          </Tag>
        )
      case "misc":
        return (
          <Tag style={styles.tag} color="#D9D9D9">
            <CloseOutlined style={{ fontSize: 16, marginRight: 3, position: 'relative', top: 1.5 }} />
          </Tag>
        )
    }
  }

  isDataString = data => {
    return typeof data === 'string';
  }

  render() {
    const { rows, expandedRowKeys, expandAll } = this.state

    // events will come in separately and related events will have same router_uuid
    const aggregatedRows = Object.values(groupBy(rows, 'router_uuid')).map(routerEvents => {
      const orderedRouterEvents = sortBy(routerEvents, ["reported_at"]);
      let firstEvent = orderedRouterEvents[0];

      // data field might initially come in as json when new event is added but normally won't
      let firstEventData = firstEvent.data;
      if (this.isDataString(firstEvent.data)) {
        firstEventData = JSON.parse(firstEvent.data);
      }
      
      return ({
        id: firstEvent.router_uuid,
        description: firstEvent.description,
        reported_at: firstEvent.reported_at,
        category: firstEvent.category,
        sub_categories: orderedRouterEvents.map(e => e.sub_category),
        fct: firstEvent.frame_up || firstEvent.frame_down,
        payload_size: firstEventData.payload_size,
        port: firstEventData.port,
        devaddr: firstEventData.devaddr,
        hotspots: orderedRouterEvents.filter(
          event => this.isDataString(event.data) ? JSON.parse(event.data).hotspot : event.data.hotspot
        ).map(he => ({ ...(this.isDataString(he.data) ? JSON.parse(he.data).hotspot : he.data.hotspot), time: he.reported_at })),
        integrations: orderedRouterEvents.filter(
          event => this.isDataString(event.data) ? JSON.parse(event.data).integration : event.data.integration
        ).map(ie => ({ ...(this.isDataString(ie.data) ? JSON.parse(ie.data).integration : ie.data.integration), description: ie.description }))
      })
    });

    aggregatedRows.sort((a, b) => (a.reported_at < b.reported_at) ? 1 : -1);

    const columns = [
      {
        title: 'Frame Count',
        dataIndex: 'data',
        render: (data, row) => this.renderFrameIcons(row)
      },
      {
        title: 'Type',
        dataIndex: 'category',
        render: (data, row) => <Text>{categoryTag(row.category, row.sub_categories)}</Text>
      },
      {
        title: 'Time',
        dataIndex: 'reported_at',
        align: 'left',
        render: data => <Text style={{textAlign:'left'}}>{formatDatetime(data)}</Text>
      }
    ]

    const { loading, error } = this.props.deviceEventsQuery

    if (loading) return <SkeletonLayout />;
    if (error) return (
      <Text>Data failed to load, please reload the page and try again</Text>
    )

    return(
      <div style={{ minWidth: 800 }}>
        <div style={{padding: 20}}>
          <div className="chart-legend-bulb red"></div>
          <Text>
            Live Data
          </Text>
        </div>
        <div style={{padding: 20, boxSizing: 'border-box'}}>
        <PacketGraph events={aggregatedRows} />
        </div>
        <div style={{padding: 20, width: '100%', background: '#F6F8FA', borderBottom: '1px solid #e1e4e8', borderTop: '1px solid #e1e4e8', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <span>
            <Text strong style={{ fontSize: 17, color: 'rgba(0, 0, 0, 0.85)'}}>
              Event Log
            </Text>

            <Checkbox
              onChange={() => this.toggleExpandAll(aggregatedRows)}
              checked={expandAll}
              style={{ marginLeft: 20 }}
            >
              Expand All
            </Checkbox>
          </span>
          <a
            href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(rows, null, 2))}`}
            download="event-debug.json"
            onClick={() => { analyticsLogger.logEvent("ACTION_EXPORT_DEVICE_EVENTS_LOG", { device_id: this.props.device_id }) }}
          >
            <Button size="small">
              Export JSON
            </Button>
          </a>
        </div>
        <Table
          dataSource={aggregatedRows}
          columns={columns}
          rowKey={record => record.id}
          pagination={false}
          expandedRowRender={this.renderExpanded}
          expandedRowKeys={expandedRowKeys}
          onExpand={this.onExpandRow}
        />
      </div>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {
    socket: state.apollo.socket,
  }
}

export default connect(mapStateToProps, null)(
  withGql(EventsDashboard, DEVICE_EVENTS, props => ({ fetchPolicy: 'network-only', variables: { device_id: props.device_id, }, name: 'deviceEventsQuery' }))
)
