import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import get from 'lodash/get'
import LabelTag from '../common/LabelTag'
import UserCan from '../common/UserCan'
import { PAGINATED_CHANNELS, CHANNEL_SUBSCRIPTION } from '../../graphql/channels'
import { graphql } from 'react-apollo';
import { Table, Button, Empty, Pagination, Typography } from 'antd';
const { Text } = Typography

const queryOptions = {
  options: props => ({
    variables: {
      page: 1,
      pageSize: 10
    },
    fetchPolicy: 'cache-and-network',
  })
}

@graphql(PAGINATED_CHANNELS, queryOptions)
class ChannelsTable extends Component {
  state = {
    page: 1,
    pageSize: get(this.props.data, ['variables', 'pageSize']) || 10
  }

  componentDidMount() {
    const { subscribeToMore} = this.props.data

    subscribeToMore({
      document: CHANNEL_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        this.handleSubscriptionAdded()
      }
    })
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
        title: 'Name',
        dataIndex: 'name',
        render: (text, record) => (
          <Link to={`/integrations/${record.id}`}>{text}</Link>
        )
      },
      {
        title: 'Type',
        dataIndex: 'type_name'
      },
      {
        title: 'Labels',
        dataIndex: 'labels',
        render: (text, record) => (
          <div>
            {
              record.labels.map(l => (
                <LabelTag key={l.id} text={l.name} color={l.color} hasIntegrations={l.devices.length > 0} />
              ))
            }
          </div>
        )
      },
      {
        title: 'Devices',
        dataIndex: 'device_count',
        render: text => text ? text : 0
      },
      {
        title: '',
        key: 'action',
        render: (text, record) => (
          <UserCan>
            <Button
              type="danger"
              icon="delete"
              onClick={() => this.props.openDeleteChannelModal(record)}
            />
          </UserCan>
        )
      },
    ]

    const { channels, loading, error } = this.props.data

    if (loading) return null;
    if (error) return (
      <Text>Data failed to load, please reload the page and try again</Text>
    )

    return (
      <div>
        <Table
          columns={columns}
          dataSource={channels.entries}
          rowKey={record => record.id}
          pagination={false}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end'}}>
          <Pagination
            current={channels.pageNumber}
            pageSize={channels.pageSize}
            total={channels.totalEntries}
            onChange={page => this.handleChangePage(page)}
          />
        </div>
      </div>
    )
  }
}

export default ChannelsTable
