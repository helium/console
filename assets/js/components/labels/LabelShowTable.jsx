import React, { Component } from 'react'
import { graphql } from 'react-apollo';
import { Link } from 'react-router-dom';
import moment from 'moment'
import get from 'lodash/get'
import LabelTag from '../common/LabelTag'
import UserCan from '../common/UserCan'
import { PAGINATED_DEVICES_BY_LABEL } from '../../graphql/devices'
import { LABEL_UPDATE_SUBSCRIPTION } from '../../graphql/labels'
import { Card, Button, Typography, Table, Pagination, Select } from 'antd';
const { Text } = Typography
const { Option } = Select

const queryOptions = {
  options: props => ({
    variables: {
      page: 1,
      pageSize: 10,
      labelId: props.labelId
    },
    fetchPolicy: 'cache-and-network',
  })
}

@graphql(PAGINATED_DEVICES_BY_LABEL, queryOptions)
class LabelShowTable extends Component {
  state = {
    page: 1,
    pageSize: get(this.props.data, ['variables', 'pageSize']) || 10,
    selectedRows: [],
  }

  componentDidMount() {
    const { subscribeToMore} = this.props.data
    const { page, pageSize } = this.state

    subscribeToMore({
      document: LABEL_UPDATE_SUBSCRIPTION,
      variables: { id: this.props.labelId },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        this.refetchPaginatedEntries(page, pageSize)
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
            <UserCan>
              <Link to="#" onClick={() => this.props.openRemoveDevicesFromLabelModal([record])}>Remove</Link>
              <Text>{" | "}</Text>
            </UserCan>
            <Link to={`/devices/${record.id}`}>Show</Link>
          </div>
        )
      },
    ]

    const { loading, error, devices_by_label } = this.props.data

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
        bodyStyle={{ padding: 0, paddingTop: 1 }}
        title={`${devices_by_label.entries.length} Devices`}
        extra={
          <UserCan>
            <Select
              value="Quick Action"
              style={{ width: 220 }}
              onSelect={this.handleSelectOption}
            >
              <Option value="remove" style={{ color: '#F5222D' }}>Remove Devices from Label</Option>
            </Select>
          </UserCan>
        }
      >
        <Table
          columns={columns}
          dataSource={devices_by_label.entries}
          rowKey={record => record.id}
          pagination={false}
          rowSelection={rowSelection}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 0}}>
          <Pagination
            current={devices_by_label.pageNumber}
            pageSize={devices_by_label.pageSize}
            total={devices_by_label.totalEntries}
            onChange={page => this.handleChangePage(page)}
            style={{marginBottom: 20}}
          />
        </div>
      </Card>
    )
  }
}

export default LabelShowTable
