import React, { Component } from 'react'
import { graphql } from 'react-apollo';
import { Link } from 'react-router-dom';
import moment from 'moment'
import get from 'lodash/get'
import LabelTag from '../common/LabelTag'
import UserCan from '../common/UserCan'
import { redForTablesDeleteText } from '../../util/colors'
import { PAGINATED_LABELS, LABEL_SUBSCRIPTION } from '../../graphql/labels'
import { Card, Button, Typography, Table, Pagination, Select } from 'antd';
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

@graphql(PAGINATED_LABELS, queryOptions)
class LabelIndexTable extends Component {
  state = {
    page: 1,
    pageSize: get(this.props.data, ['variables', 'pageSize']) || 10,
    selectedRows: [],
  }

  componentDidMount() {
    const { subscribeToMore } = this.props.data

    subscribeToMore({
      document: LABEL_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        this.handleSubscriptionAdded()
        this.setState({ selectedRows: [] })
      }
    })
  }

  handleSelectOption = (value) => {
    if (value === 'removeDevices') this.props.openRemoveAllDevicesFromLabelsModal(this.state.selectedRows)
    else this.props.openDeleteLabelModal(this.state.selectedRows)
  }

  handleSubscriptionAdded = () => {
    const { page, pageSize } = this.state
    this.refetchPaginatedEntries(page, pageSize)
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
        title: 'Labels',
        dataIndex: 'name',
        render: (text, record) => (
          <React.Fragment>
            <Text>{text}</Text><LabelTag text={text} color={record.color} hasIntegrations={record.channels.length > 0} style={{ marginLeft: 10 }} />
          </React.Fragment>
        )
      },
      {
        title: 'Associated Integrations',
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
        title: 'No. of Devices',
        dataIndex: 'devices',
        render: (text, record) => <Text>{record.devices.length}</Text>
      },
      {
        title: 'Creator',
        dataIndex: 'creator',
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
              <Link to="#" onClick={() => this.props.openDeleteLabelModal(record.id)}>Delete</Link>
              <Text>{" | "}</Text>
            </UserCan>
            <Link to={`/labels/${record.id}`}>Show</Link>
          </div>
        )
      },
    ]

    const { loading, error, labels } = this.props.data

    if (loading) return null;
    if (error) return (
      <Text>Data failed to load, please reload the page and try again</Text>
    )

    const rowSelection = {
      onChange: (keys, selectedRows) => this.setState({ selectedRows })
    }

    return (
      <Card
        bodyStyle={{ padding: 0, paddingTop: 1, overflowX: 'scroll' }}
        title={`${labels.entries.length} Labels`}
        extra={
          <UserCan>
            <Select
              value="Quick Action"
              style={{ width: 220, marginRight: 10 }}
              onSelect={this.handleSelectOption}
            >
              <Option value="removeDevices" disabled={this.state.selectedRows.length == 0}>Remove All Devices From Selected Labels</Option>
              <Option value="remove" disabled={this.state.selectedRows.length == 0} style={{ color: redForTablesDeleteText }}>Delete Selected Labels</Option>
            </Select>
            <Button
              type="primary"
              icon="tag"
              onClick={this.props.openCreateLabelModal}
            >
              Create New Label
            </Button>
          </UserCan>
        }
      >
        <Table
          columns={columns}
          dataSource={labels.entries}
          rowKey={record => record.id}
          pagination={false}
          rowSelection={rowSelection}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 0}}>
          <Pagination
            current={labels.pageNumber}
            pageSize={labels.pageSize}
            total={labels.totalEntries}
            onChange={page => this.handleChangePage(page)}
            style={{marginBottom: 20}}
          />
        </div>
      </Card>
    )
  }
}

export default LabelIndexTable
