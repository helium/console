import React, { Component } from 'react'
import { formatUnixDatetime, getDiffInSeconds } from '../../util/time'
import merge from 'lodash/merge'
import PacketGraph from '../common/PacketGraph'
import { DEVICE_EVENTS, EVENTS_SUBSCRIPTION } from '../../graphql/events'
import { graphql } from 'react-apollo';
import { Typography, Table } from 'antd';
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
          dataSource={this.state.rows}
          columns={columns}
          rowKey={record => record.id}
          pagination={false}
        />
      </React.Fragment>
    )
  }
}

export default EventsDashboard
