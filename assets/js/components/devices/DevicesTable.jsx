import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment'
import find from 'lodash/find'
import get from 'lodash/get'
import UserCan from '../common/UserCan'
import LabelTag from '../common/LabelTag'
import { PAGINATED_DEVICES, DEVICE_SUBSCRIPTION } from '../../graphql/devices'
import analyticsLogger from '../../util/analyticsLogger'
import { Query } from 'react-apollo';
import { Table, Button, Empty, Pagination, Tag, Typography, Select } from 'antd';
import EmptyImg from '../../../img/emptydevice.svg'
import { Card } from 'antd';
const { Text } = Typography
const { Option } = Select

const defaultVariables = {
  page: 1,
  pageSize: 10
}

class DevicesTable extends Component {
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
        title: 'Date Activated',
        dataIndex: 'inserted_at',
        render: data => moment.utc(data).local().format('lll')
      },
      {
        title: '',
        key: 'action',
        render: (text, record) => (
          <div>
            <Link to="#" onClick={() => this.props.openDeleteDeviceModal(record.id)}>Delete</Link>
            <Text>{" | "}</Text>
            <Link to={`/devices/${record.id}`}>Show</Link>
          </div>
        )
      },
    ]

    return (
      <Query query={PAGINATED_DEVICES} fetchPolicy={'cache-and-network'} variables={defaultVariables}>
        {({ loading, error, data, fetchMore, subscribeToMore, variables }) => (
          <QueryResults
            loading={loading}
            error={error}
            data={data}
            columns={columns}
            fetchMore={fetchMore}
            subscribeToMore={subscribeToMore}
            subscription={DEVICE_SUBSCRIPTION}
            variables={variables}
            {...this.props}
          />
        )}
      </Query>
    )
  }
}

class QueryResults extends Component {
  constructor(props) {
    super(props)

    this.state = {
      page: 1,
      pageSize: get(props, ['variables', 'pageSize']) || 10,
      selectedRows: [],
    }

    this.handleChangePage = this.handleChangePage.bind(this)
    this.refetchPaginatedEntries = this.refetchPaginatedEntries.bind(this)
    this.handleSubscriptionAdded = this.handleSubscriptionAdded.bind(this)
    this.handleSelectOption = this.handleSelectOption.bind(this)
  }

  componentDidMount() {
    const { subscribeToMore, subscription, fetchMore, variables } = this.props

    subscription && subscribeToMore({
      document: subscription,
      variables,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        this.handleSubscriptionAdded()
      }
    })
  }

  handleSelectOption(value) {
    if (value === 'addLabel') {
      this.props.openDevicesAddLabelModal(this.state.selectedRows)
    } else {
      this.props.openDeleteDeviceModal(this.state.selectedRows)
    }
  }

  handleChangePage(page) {
    this.setState({ page })

    const { pageSize } = this.state
    this.refetchPaginatedEntries(page, pageSize)
  }

  handleSubscriptionAdded() {
    const { page, pageSize } = this.state
    this.refetchPaginatedEntries(page, pageSize)
  }

  refetchPaginatedEntries(page, pageSize) {
    const { fetchMore } = this.props
    fetchMore({
      variables: { page, pageSize },
      updateQuery: (prev, { fetchMoreResult }) => fetchMoreResult
    })
  }

  render() {
    const { loading, error, data, columns, openCreateDeviceModal } = this.props

    if (loading) return null;
    if (error) return (
      <Text>Data failed to load, please reload the page and try again</Text>
    )

    const results = find(data, d => d.entries !== undefined)

    if (results.entries.length === 0) return (
      <Empty
        style={{marginBottom: 70}}
        image={EmptyImg}
        description={<span>No Devices</span>}
      />
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
        bodyStyle={{ padding: 0, paddingTop: 1 }}
        title={`${results.entries.length} Devices`}
        extra={
          <React.Fragment>
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
          </React.Fragment>
        }
      >
        <Table
          columns={columns}
          dataSource={results.entries}
          rowKey={record => record.id}
          pagination={false}
          rowSelection={rowSelection}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 0}}>
          <Pagination
            current={results.pageNumber}
            pageSize={results.pageSize}
            total={results.totalEntries}
            onChange={page => this.handleChangePage(page)}
            hideOnSinglePage={true}
            style={{marginBottom: 20}}
          />
        </div>
      </Card>
    )
  }
}

export default DevicesTable
