import React, { Component } from 'react'
import { Query } from 'react-apollo';
import { Link } from 'react-router-dom';
import find from 'lodash/find'
import moment from 'moment'
import get from 'lodash/get'
import LabelTag from '../common/LabelTag'
import { PAGINATED_DEVICES_BY_LABEL, LABEL_UPDATE_SUBSCRIPTION } from '../../graphql/devices'
import { Card, Button, Typography, Table, Pagination, Select } from 'antd';
const { Text } = Typography
const { Option } = Select

const defaultVariables = {
  page: 1,
  pageSize: 10
}

class LabelShowTable extends Component {
  render() {
    const columns = [
      {
        title: 'Device Name',
        dataIndex: 'name',
      },
      {
        title: 'Labels',
        dataIndex: 'labels',
        render: (text, record) => (
          <span>
            {
              record.labels.map(l => (
                <LabelTag key={l.name} text={l.name} color={l.color} />
              ))
            }
          </span>
        )
      },
      {
        title: 'Date Activated',
        dataIndex: 'inserted_at',
        render: data => moment.utc(data).local().format('lll')
      },
      {
        title: 'Action',
        key: 'action',
        render: (text, record) => (
          <div>
            <Link to="#" onClick={() => this.props.openRemoveDevicesFromLabelModal([record])}>Remove</Link>
            <Text>{" | "}</Text>
            <Link to={`/devices/${record.id}`}>Show</Link>
          </div>
        )
      },
    ]

    const variables = Object.assign({}, defaultVariables, { labelId: this.props.labelId })

    return (
      <Query query={PAGINATED_DEVICES_BY_LABEL} fetchPolicy={'cache-and-network'} variables={variables}>
        {({ loading, error, data, fetchMore, subscribeToMore, variables }) => (
          <QueryResults
            loading={loading}
            error={error}
            columns={columns}
            data={data}
            fetchMore={fetchMore}
            subscribeToMore={subscribeToMore}
            subscription={LABEL_UPDATE_SUBSCRIPTION}
            variables={variables}
            {...this.props}
          />
        )}
      </Query>
    )
  }
}

class QueryResults extends Component {
  state = {
    page: 1,
    pageSize: get(this.props, ['variables', 'pageSize']) || 10,
    selectedRows: [],
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

  handleSelectOption = () => {
    this.props.openRemoveDevicesFromLabelModal(this.state.selectedRows)
  }

  handleChangePage = (page) => {
    this.setState({ page })

    const { pageSize } = this.state
    this.refetchPaginatedEntries(page, pageSize)
  }

  refetchPaginatedEntries = (page, pageSize) => {
    const { fetchMore } = this.props
    fetchMore({
      variables: { page, pageSize },
      updateQuery: (prev, { fetchMoreResult }) => fetchMoreResult
    })
  }

  render() {
    const { loading, error, data, columns } = this.props

    if (loading) return null;
    if (error) return (
      <Text>Data failed to load, please reload the page and try again</Text>
    )

    const results = find(data, d => d.entries !== undefined)

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
          <Select
            value="Quick Action"
            style={{ width: 220 }}
            onSelect={this.handleSelectOption}
          >
            <Option value="remove" style={{ color: '#F5222D' }}>Remove Devices from Label</Option>
          </Select>
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
            style={{marginBottom: 20}}
          />
        </div>
      </Card>
    )
  }
}

export default LabelShowTable
