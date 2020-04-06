import React, { Component } from 'react'
import { formatUnixDatetime, getDiffInSeconds } from '../../util/time'
import uniqBy from 'lodash/uniqBy';
import groupBy from 'lodash/groupBy';
import PacketGraph from '../common/PacketGraph'
import { DEVICE_EVENTS, EVENTS_SUBSCRIPTION } from '../../graphql/events'
import { graphql } from 'react-apollo';
import { Badge, Card, Col, Row, Typography, Table, Tag } from 'antd';
const { Text } = Typography

const queryOptions = {
  options: props => ({
    variables: {
      device_id: props.device_id,
    },
    fetchPolicy: 'network-only',
  })
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

const categoryTag = (category) => {
  switch(category) {
    case "up":
      return <Tag color="green">uplink</Tag>
    case "down":
      return <Tag color="red">downlink</Tag>
    case "ack":
      return <Tag color="orange">ack</Tag>
    case "activation":
      return <Tag color="blue">activation</Tag>
  }
}

const statusBadge = (status) => {
  switch(status) {
    case "error":
      return <Badge status="error" />
    case "success":
      return <Badge status="success" />
    default:
      return <Badge status="default" text={status} />
  }
}

@graphql(DEVICE_EVENTS, queryOptions)
class EventsDashboard extends Component {
  state = {
    rows: []
  }

  componentDidUpdate(prevProps) {
    const { deviceEvents, loading, subscribeToMore, variables } = this.props.data

    if (prevProps.data.loading && !loading) {
      this.setState({ rows: deviceEvents }, () => {
        subscribeToMore({
          document: EVENTS_SUBSCRIPTION,
          variables,
          updateQuery: (prev, { subscriptionData }) => {
            if (!subscriptionData.data) return prev
            this.addEvent(subscriptionData.data.eventAdded)
          }
        })
      })
    }
  }

  addEvent = event => {
    const { rows } = this.state
    const lastEvent = rows[rows.length - 1]
    if (rows.length > 100 && getDiffInSeconds(parseInt(lastEvent.reported_at)) > 300) {
      rows.pop()
    }
    this.setState({
      rows: [event].concat(rows)
    })
  }

  renderExpanded = record => {
    const hotspotColumns = [
      { title: 'Hotspot Name', dataIndex: 'name' },
      { title: 'RSSI', dataIndex: 'rssi' },
      { title: 'SNR', dataIndex: 'snr', render: data => <span>{(Math.round(data * 100) / 100).toFixed(2)}</span> },
      { title: 'Frequency', dataIndex: 'frequency', render: data => <span>{(Math.round(data * 100) / 100).toFixed(2)}</span> },
      { title: 'Spreading', dataIndex: 'spreading' },
    ]

    const channelColumns = [
      { title: 'Channel Name', dataIndex: 'name' },
      { title: 'Message', render: (data, record) => <Text>{statusBadge(record.status)}{record.description}</Text> }
    ]

    return (
      <Row gutter={10}>
        <Col span={22}>
          <Card bordered={false}>
            <Table columns={hotspotColumns} dataSource={record.hotspots} pagination={false} rowKey={record => record.id}/>
          </Card>
          <Card bordered={false}>
            <Table columns={channelColumns} dataSource={record.channels} pagination={false} rowKey={record => record.id}/>
          </Card>
        </Col>
      </Row>
    )
  }

  render() {
    const { rows } = this.state

    const columns = [
      {
        dataIndex: 'category',
        render: data => <span>{categoryTag(data)}</span>
      },
      {
        title: 'Payload',
        dataIndex: 'payload',
        render: data => <span>{base64ToHex(data)}</span>
      },
      ,
      {
        title: 'FCnt',
        dataIndex: 'frame_up',
        render: (data, row) => row.category === 'up' ? <span>{row.frame_up}</span> : <span>{row.frame_down}</span>
      },
      {
        title: 'Port',
        dataIndex: 'port',
      },
      {
        title: 'DevAddr',
        dataIndex: 'devaddr',
      },
      {
        title: 'Time',
        dataIndex: 'reported_at',
        render: data => <span>{formatUnixDatetime(data)}</span>
      },
    ]

    const { loading, error } = this.props.data

    if (loading) return null;
    if (error) return (
      <Text>Data failed to load, please reload the page and try again</Text>
    )

    return(
      <React.Fragment>
        <div>
          <div className="chart-legend-bulb red"></div>
          <Text>
            Live Data
          </Text>
        </div>
        <PacketGraph events={this.state.rows} />

        <Text strong>
          Event Log
        </Text>
        <br />
        <Table
          dataSource={rows}
          columns={columns}
          rowKey={record => record.id}
          pagination={false}
          expandedRowRender={this.renderExpanded}
        />
      </React.Fragment>
    )
  }
}

export default EventsDashboard
