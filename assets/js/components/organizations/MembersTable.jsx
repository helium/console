import React, { Component } from 'react'
import find from 'lodash/find'
import get from 'lodash/get'
import moment from 'moment'
import UserCan from '../common/UserCan'
import { PAGINATED_MEMBERSHIPS, MEMBERSHIP_SUBSCRIPTION } from '../../graphql/memberships'
import analyticsLogger from '../../util/analyticsLogger'
import { Query } from 'react-apollo';
import { Table, Button, Empty, Pagination, Tag } from 'antd';

const defaultVariables = {
  page: 1,
  pageSize: 10
}

class MembersTable extends Component {
  render() {
    const {
       openEditMembershipModal,
       openDeleteUserModal
    } = this.props

    const columns = [
      {
        title: 'User',
        dataIndex: 'email'
      },
      {
        title: 'Role',
        dataIndex: 'role',
        render: text => <Role role={text} />
      },
      {
        title: 'Two-Factor',
        dataIndex: 'two_factor_enabled',
        render: data => data ? <Tag color="blue">Enabled</Tag> : <Tag color="red">Disabled</Tag>
      },
      {
        title: 'Joined',
        dataIndex: 'inserted_at',
        render: data => moment(data).format('LL')
      },
      {
        title: '',
        key: 'action',
        render: (text, record) => (
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Button
              onClick={() => {
                analyticsLogger.logEvent("ACTION_OPEN_EDIT_MEMBERSHIP", {"email": record.email})
                openEditMembershipModal(record)
              }}
              style={{ marginRight: 5 }}
              type="primary"
            >
              Edit
            </Button>

            <Button
              onClick={() => {
                analyticsLogger.logEvent("ACTION_OPEN_DELETE_USER", {"email": record.email})
                openDeleteUserModal(record, "membership")
              }}
              type="danger"
              icon="delete"
            />
          </div>
        )
      },
    ]

    return (
      <Query query={PAGINATED_MEMBERSHIPS} fetchPolicy={'cache-and-network'} variables={defaultVariables}>
        {({ loading, error, data, fetchMore, subscribeToMore, variables }) => (
          <QueryResults
            loading={loading}
            error={error}
            data={data}
            columns={columns}
            fetchMore={fetchMore}
            subscribeToMore={subscribeToMore}
            subscription={MEMBERSHIP_SUBSCRIPTION}
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
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={<span>No Members</span>}
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
            hideOnSinglePage={true}
            style={{marginBottom: 20}}
          />
        </div>
      </div>
    )
  }
}

const Role = (props) => {
  switch(props.role) {
    case 'admin':
      return <span>Administrator</span>
    case 'manager':
      return <span>Manager</span>
    default:
      return <span>{props.role}</span>
  }
}

export default MembersTable
