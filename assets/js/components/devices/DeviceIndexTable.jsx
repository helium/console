import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment'
import get from 'lodash/get'
import LabelTag from '../common/LabelTag'
import UserCan from '../common/UserCan'
import { PAGINATED_DEVICES, DEVICE_SUBSCRIPTION } from '../../graphql/devices'
import analyticsLogger from '../../util/analyticsLogger'
import { graphql } from 'react-apollo';
import { Table, Button, Empty, Pagination, Typography, Select, Card } from 'antd';
const { Text } = Typography
const { Option } = Select

const queryOptions = {
  options: props => ({
    variables: {
      page: 1,
      pageSize: 10
    },
    fetchPolicy: 'cache-and-network',
  })
}

@graphql(PAGINATED_DEVICES, queryOptions)
class DeviceIndexTable extends Component {
  state = {
    page: 1,
    pageSize: get(this.props.data, ['variables', 'pageSize']) || 10,
    selectedRows: [],
  }

  componentDidMount() {
    const { subscribeToMore } = this.props.data

    subscribeToMore({
      document: DEVICE_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        this.handleSubscriptionAdded()
      }
    })
  }

  handleSelectOption = (value) => {
    if (value === 'addLabel') {
      this.props.openDevicesAddLabelModal(this.state.selectedRows)
    } else {
      this.props.openDeleteDeviceModal(this.state.selectedRows)
    }
  }

  handleChangePage = (page) => {
    this.setState({ page })

    const { pageSize } = this.state
    this.refetchPaginatedEntries(page, pageSize)
  }

  handleSubscriptionAdded = () => {
    const { page, pageSize } = this.state
    this.refetchPaginatedEntries(page, pageSize)
  }

  refetchPaginatedEntries = (page, pageSize) => {
    const { fetchMore } = this.props.data
    fetchMore({
      variables: { page, pageSize },
      updateQuery: (prev, { fetchMoreResult }) => fetchMoreResult
    })
  }

  render() {
    const columns = [
      {
        title: 'Device Name',
        dataIndex: 'name',
      },
      {
        title: 'Device EUI',
        dataIndex: 'dev_eui',
      },
      {
        title: 'Labels',
        dataIndex: 'labels',
        render: labels => {
          return <React.Fragment>
            {
              labels.map(l => <LabelTag key={l.name} text={l.name} color={l.color} />)
            }
          </React.Fragment>
        }
      },
      {
        title: 'Integrations',
        dataIndex: 'channels',
        render: (text, record) => (
          <div>
            {
              record.channels.map((c, i) => <Text key={c.id}>{c.name}{i != record.channels.length - 1 && ", "}</Text>)
            }
          </div>
        )
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
        title: 'Packets Transferred',
        dataIndex: 'total_packets',
      },
      {
        title: 'Date Activated',
        dataIndex: 'inserted_at',
        render: data => moment.utc(data).local().format('lll')
      },
      {
        title: 'Last Connected',
        dataIndex: 'last_connected',
        render: data => data ? moment.utc(data).local().format('lll') : ""
      },
      {
        title: '',
        key: 'action',
        render: (text, record) => (
          <div>
            <UserCan>
              <Link to="#" onClick={() => this.props.openDeleteDeviceModal(record.id)}>Delete</Link>
              <Text>{" | "}</Text>
            </UserCan>
            <Link to={`/devices/${record.id}`}>Show</Link>
          </div>
        )
      },
    ]

    const { devices, loading, error } = this.props.data

    if (loading) return null;
    if (error) return (
      <Text>Data failed to load, please reload the page and try again</Text>
    )

    const rowSelection = {
      onSelect: (record, selected) => {
        const { selectedRows } = this.state
        if (selected) this.setState({ selectedRows: selectedRows.concat(record) })
        else this.setState({ selectedRows: selectedRows.filter(r => r.id !== record.id) })
      },
      onSelectAll: (selected, selectedRows) => {
        if (selected) this.setState({ selectedRows })
        else this.setState({ selectedRows: [] })
      },
    }

    return (
      <Card
        bodyStyle={{ padding: 0, paddingTop: 1, overflow: 'hidden' }}
        title={`${devices.entries.length} Devices`}
        extra={
          <UserCan>
            <Select
              value="Quick Action"
              style={{ width: 220, marginRight: 10 }}
              onSelect={this.handleSelectOption}
            >
              <Option value="addLabel">Add Label to Selected Devices</Option>
              <Option value="delete" style={{ color: '#F5222D' }}>Delete Selected Devices</Option>
            </Select>
            <Button
              type="primary"
              icon="plus"
              onClick={this.props.openCreateDeviceModal}
            >
              Add Device
            </Button>
          </UserCan>
        }
      >
        <Table
          columns={columns}
          dataSource={devices.entries}
          rowKey={record => record.id}
          pagination={false}
          rowSelection={rowSelection}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 0}}>
          <Pagination
            current={devices.pageNumber}
            pageSize={devices.pageSize}
            total={devices.totalEntries}
            onChange={page => this.handleChangePage(page)}
            style={{marginBottom: 20}}
          />
        </div>
      </Card>
    )
  }
}

export default DeviceIndexTable
