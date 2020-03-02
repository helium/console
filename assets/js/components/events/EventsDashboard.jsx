import React, { Component } from 'react'
import { formatUnixDatetime, getDiffInSeconds } from '../../util/time'
import merge from 'lodash/merge'
import PacketGraph from '../common/PacketGraph'
import { EVENTS_SUBSCRIPTION } from '../../graphql/events'
import { Subscription } from 'react-apollo';
import { Typography, Table } from 'antd';
const { Text } = Typography

class EventsDashboard extends Component {
  state = {
    rows: []
  }

  addEvent = (event) => {
    const { rows } = this.state
    const lastEvent = rows[rows.length - 1]
    if (rows.length > 100 && getDiffInSeconds(parseInt(lastEvent.reported_at)) > 300) {
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
        title: 'Channel',
        dataIndex: 'channel_name',
      },
      {
        title: 'Hotspot Name',
        dataIndex: 'hotspot_name',
      },
      {
        title: 'Status',
        dataIndex: 'status',
      },
      {
        title: 'Description',
        dataIndex: 'description',
      },
      {
        title: 'Payload',
        dataIndex: 'payload',
      },
      {
        title: 'Size',
        dataIndex: 'payload_size',
        render: data => <span>{data ? `${data} bytes` : ""} </span>
      },
      {
        title: 'RSSI',
        dataIndex: 'rssi',
      },
      {
        title: 'SNR',
        dataIndex: 'snr',
        render: data => <span>{(Math.round(data * 100) / 100).toFixed(2)}</span>
      },
      {
        title: 'Category',
        dataIndex: 'category',
      },
      {
        title: 'Frame Up',
        dataIndex: 'frame_up',
      },
      {
        title: 'Frame Down',
        dataIndex: 'frame_down',
      },
      {
        title: 'Reported At',
        dataIndex: 'reported_at',
        render: data => <span>{formatUnixDatetime(data)}</span>
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
