import React, { Component } from 'react'
import { formatUnixDatetime, getDiffInSeconds } from '../../util/time'
import uniqBy from 'lodash/uniqBy';
import groupBy from 'lodash/groupBy';
import PacketGraph from '../common/PacketGraph'
import { DEVICE_EVENTS, EVENTS_SUBSCRIPTION } from '../../graphql/events'
import { graphql } from 'react-apollo';
import { Badge, Card, Col, Row, Typography, Table, Tag } from 'antd';
import { Base64 } from 'js-base64';
const { Text } = Typography

const queryOptions = {
  options: props => ({
    variables: {
      device_id: props.device_id,
    },
    fetchPolicy: 'network-only',
  })
}

@graphql(DEVICE_EVENTS, queryOptions)
class EventsDashboard extends Component {
  state = {
    rows: []
  }

  componentDidUpdate(prevProps) {
    const { deviceEvents, loading, subscribeToMore, variables } = this.props.data

    if (prevProps.data.loading && !loading && deviceEvents.length > 0) {
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

  addEvent = (event) => {
    const { rows } = this.state
    const lastEvent = rows[rows.length - 1]
    if (rows.length > 100 && getDiffInSeconds(parseInt(lastEvent.reported_at)) > 300) {
      rows.pop()
    }
    this.setState({
      rows: [event].concat(rows)
    })
  }

  render() {
    const fcntGroupedRows = groupBy(this.state.rows, function(n) {
      return n.frame_up;
    });
    const uniqChannels = uniqBy(this.state.rows, 'channel_name');
    const uniqRows = uniqBy(this.state.rows, 'frame_up');

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
        case "failure":
          return <Badge status="error" />
        case "success":
          return <Badge status="success" />
        default:
          return <Badge status="default" text={status} />
      }
    }

    function toHexString(byteArray) {
      return Array.from(byteArray, function(byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
      }).join('')
    }

    const columns = [
      {
        dataIndex: 'category',
        render: data => <span>{categoryTag(data)}</span>
      },
      {
        title: 'Payload',
        dataIndex: 'payload',
        render: data => <span>{toHexString(Base64.decode(data))}</span>
      },
      ,
      {
        title: 'FCnt',
        dataIndex: 'frame_up',
      },
      {
        title: 'Time',
        dataIndex: 'reported_at',
        render: data => <span>{formatUnixDatetime(data)}</span>
      },
    ]

    const expandedRowRender = (record) => {
      const hotspotColumns = [
        { title: 'Hotspot Name', dataIndex: 'hotspot_name', key: 'hotspot_name' },
        { title: 'RSSI', dataIndex: 'rssi', key: 'rssi' },
        { title: 'SNR', dataIndex: 'snr', key: 'snr' }
      ]
      const hotspotData = uniqBy(fcntGroupedRows[record.frame_up], 'hotspot_name');

      const channelColumns = [
        { dataIndex: 'status', key: 'status', render: data => <span>{statusBadge(data)}</span> },
        { title: 'Integration', dataIndex: 'channel_name', key: 'channel_name' },
        { title: 'Response', dataIndex: 'description', key: 'description' }
      ]

      return <Row>
              <Col span={12}>
                <Card bordered={false}>
                  <Table columns={hotspotColumns} dataSource={hotspotData} pagination={false} rowKey={record => record.hotspot_name}/>
                </Card>
              </Col>
              <Col span={12}>
                <Card bordered={false}>
                  <Table columns={channelColumns} dataSource={uniqChannels} pagination={false} rowKey={record => record.hotspot_name}/>
                </Card>
              </Col>
              </Row>

    }

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
          dataSource={uniqRows}
          columns={columns}
          rowKey={record => record.id}
          pagination={false}
          expandedRowRender={record => expandedRowRender(record)}
        />
      </React.Fragment>
    )
  }
}

export default EventsDashboard
