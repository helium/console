import React, { Component } from 'react'
import { formatUnixDatetime, getDiffInSeconds } from '../../util/time'
import merge from 'lodash/merge'
import PacketGraph from '../common/PacketGraph'
import { EVENTS_SUBSCRIPTION } from '../../graphql/events'
import { Subscription } from 'react-apollo';
import { Typography, Table } from 'antd';
const { Text } = Typography

class EventsDashboard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      rows: []
    }

    this.addEvent = this.addEvent.bind(this)
  }

  addEvent(event) {
    const { rows } = this.state
    const lastEvent = rows[rows.length - 1]
    if (rows.length > 100 && getDiffInSeconds(lastEvent.delivered_at) > 300) {
      truncated = rows.pop()
      this.setState({
        rows: [event].concat(truncated)
      })
    } else {
      this.setState({
        rows: [event].concat(rows)
      })
    }
  }

  render() {
    const { contextId, contextName, fetchPolicy } = this.props

    const columns = [
      {
        title: 'Device ID',
        dataIndex: 'id',
      },
      {
        title: 'Hotspot Name',
        dataIndex: 'hotspot_name',
      },
      {
        title: 'Channel',
        dataIndex: 'channel_name',
      },
      {
        title: 'Status',
        dataIndex: 'status',
      },
      {
        title: 'Size',
        dataIndex: 'payload_size',
        render: data => <span>{data} bytes</span>
      },
      {
        title: 'RSSI',
        dataIndex: 'rssi',
      },
      {
        title: 'SNR',
        dataIndex: 'snr',
      },
      {
        title: 'Delivered At',
        dataIndex: 'delivered_at',
        Cell: data => <span>{formatUnixDatetime(data)}</span>
      },
    ]

    return(
      <Subscription
        variables={{ contextId, contextName }}
        subscription={EVENTS_SUBSCRIPTION}
        onSubscriptionData={({ subscriptionData }) => { this.addEvent(subscriptionData.data.eventAdded) }}
      >
        {({ data }) => (
          <React.Fragment>
            <Text strong>
              Real Time Packets
            </Text>
            <div className="chart-legend left">
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
            <QueryResults
              rows={this.state.rows}
              columns={columns}
            />
          </React.Fragment>
        )}
      </Subscription>
    )
  }
}

class QueryResults extends Component {
  render() {
    const { rows, columns } = this.props

    if (rows.length === 0) {
      return (
        <Text component="p">
          No events yet
        </Text>
      )
    }

    return (
      <Table
        dataSource={rows}
        columns={columns}
        pagination={false}
      />
    )
  }
}

export default EventsDashboard
