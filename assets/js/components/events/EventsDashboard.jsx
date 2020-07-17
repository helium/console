import React, { Component } from 'react'
import { formatUnixDatetime, getDiffInSeconds } from '../../util/time'
import uniqBy from 'lodash/uniqBy';
import groupBy from 'lodash/groupBy';
import PacketGraph from '../common/PacketGraph'
import { DEVICE_EVENTS, EVENTS_SUBSCRIPTION } from '../../graphql/events'
import { graphql } from 'react-apollo';
import { Badge, Card, Col, Row, Typography, Table, Tag } from 'antd';
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';
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
      return <Text>Uplink</Text>
    case "down":
      return <Text>Downlink</Text>
    case "ack":
      return <Text>Acknowledge</Text>
    case "activation":
      return <Text>Activation</Text>
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
      { title: 'Integration Name', dataIndex: 'name' },
      { title: 'Message', render: (data, record) => <Text>{statusBadge(record.status)}{record.description}</Text> }
    ]

    return (
      <Row gutter={10}>
        <Col span={22}>
          <Card  bodyStyle={{padding: 0}}>
            <Table columns={hotspotColumns} dataSource={record.hotspots} pagination={false} rowKey={record => record.id}/>
          </Card>
          <Card  bodyStyle={{padding: 0}}>
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
        render: data => <Text>{categoryTag(data)}</Text>
      },
      {
        title: 'Frame Count',
        dataIndex: 'frame_up',
        render: (data, row) => row.category === 'up' ? <Tag style={{borderRadius: 9999, paddingBottom: 0, paddingRight: 9, fontSize: 14}} color="#4091F7"><CaretUpOutlined /> {row.frame_up}</Tag> : <Tag style={{borderRadius: 9999, paddingBottom: 0, paddingRight: 9, fontSize: 14}} color="#FA541C"><CaretDownOutlined /> {row.frame_down}</Tag>
      },
      {
        title: 'Port',
        dataIndex: 'port',
      },
      {
        title: 'Dev Address',
        dataIndex: 'devaddr',
      },
      {
        title: 'Time',
        dataIndex: 'reported_at',
        align: 'left',
        render: data => <Text style={{textAlign:'left'}}>{formatUnixDatetime(data)}</Text>
      },
    ]

    const { loading, error } = this.props.data

    if (loading) return null;
    if (error) return (
      <Text>Data failed to load, please reload the page and try again</Text>
    )

    return(
      <React.Fragment>
        <div style={{padding: 20}}>
          <div className="chart-legend-bulb red"></div>
          <Text>
            Live Data
          </Text>
        </div>
        <div style={{padding: 20, boxSizing: 'border-box'}}>
        <PacketGraph events={this.state.rows} />
        </div>
        <div style={{padding: 20, width: '100%', background: '#F6F8FA', borderBottom: '1px solid #e1e4e8', borderTop: '1px solid #e1e4e8'}}>
        <Text strong style={{display: 'block', fontSize: 19, color: 'rgba(0, 0, 0, 0.85)'}}>
          Event Log
        </Text>
        </div>
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
