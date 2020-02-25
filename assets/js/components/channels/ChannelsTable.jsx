import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import find from 'lodash/find'
import get from 'lodash/get'
import UserCan from '../common/UserCan'
import LabelTag from '../common/LabelTag'
import { PAGINATED_CHANNELS, CHANNEL_SUBSCRIPTION } from '../../graphql/channels'
import { Query } from 'react-apollo';
import { Table, Button, Empty, Pagination } from 'antd';
import EmptyImg from '../../../img/emptydevice.svg'

const defaultVariables = {
  page: 1,
  pageSize: 10
}

class ChannelsTable extends Component {
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
                <LabelTag key={l.id} text={l.name} color={l.color} />
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
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Button
              type="danger"
              icon="delete"
              onClick={() => this.props.openDeleteChannelModal(record)}
            />
          </div>
        )
      },
    ]

    return (
      <Query query={PAGINATED_CHANNELS} fetchPolicy={'cache-and-network'} variables={defaultVariables}>
        {({ loading, error, data, fetchMore, subscribeToMore, variables }) => (
          <QueryResults
            loading={loading}
            error={error}
            data={data}
            columns={columns}
            fetchMore={fetchMore}
            subscribeToMore={subscribeToMore}
            subscription={CHANNEL_SUBSCRIPTION}
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
    pageSize: get(this.props, ['variables', 'pageSize']) || 10
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

    if (results.entries.length === 0) return (
      <Empty
        image={EmptyImg}
        description={<span>No Channels</span>}
      />
    )

    return (
      <div>
        <Table
          columns={columns}
          dataSource={results.entries}
          rowKey={record => record.id}
          pagination={false}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end'}}>
          <Pagination
            current={results.pageNumber}
            pageSize={results.pageSize}
            total={results.totalEntries}
            onChange={page => this.handleChangePage(page)}
          />
        </div>
      </div>
    )
  }
}

export default ChannelsTable
