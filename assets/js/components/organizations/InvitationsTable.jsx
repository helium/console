import React, { Component } from 'react'
import get from 'lodash/get'
import moment from 'moment'
import { PAGINATED_INVITATIONS, INVITATION_SUBSCRIPTION } from '../../graphql/invitations'
import analyticsLogger from '../../util/analyticsLogger'
import UserCan from '../common/UserCan'
import RoleName from '../common/RoleName'
import { graphql } from 'react-apollo';
import { Table, Button, Empty, Pagination, Tag } from 'antd';
import SkeletonLayout from '../common/SkeletonLayout'

const queryOptions = {
  options: props => ({
    variables: {
      page: 1,
      pageSize: 10
    },
    fetchPolicy: 'cache-and-network',
  })
}

@graphql(PAGINATED_INVITATIONS, queryOptions)
class InvitationsTable extends Component {
  state = {
    page: 1,
    pageSize: get(this.props.data, ['variables', 'pageSize']) || 10
  }

  componentDidMount() {
    const { subscribeToMore } = this.props.data

    subscribeToMore({
      document: INVITATION_SUBSCRIPTION,
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
        title: 'User',
        dataIndex: 'email'
      },
      {
        title: 'Role',
        dataIndex: 'role',
        render: text => <RoleName role={text} />
      },
      {
        title: 'Sent At',
        dataIndex: 'inserted_at',
        render: data => moment(data).format('LL')
      },
      {
        title: '',
        key: 'action',
        render: (text, record) => (
          <UserCan noManager>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  analyticsLogger.logEvent("ACTION_OPEN_DELETE_USER", {"email": record.email})
                  this.props.openDeleteUserModal(record, "invitation")
                }}
                type="danger"
                icon="delete"
                shape="circle"
              />
            </div>
          </UserCan>
        )
      },
    ]

    const { loading, error, invitations } = this.props.data

    if (loading) return <SkeletonLayout />;
    if (error) return (
      <Text>Data failed to load, please reload the page and try again</Text>
    )

    return (
      <div>
        <Table
          columns={columns}
          dataSource={invitations.entries}
          rowKey={record => record.id}
          pagination={false}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end'}}>
          <Pagination
            current={invitations.pageNumber}
            pageSize={invitations.pageSize}
            total={invitations.totalEntries}
            onChange={page => this.handleChangePage(page)}
            style={{ marginBottom: 20 }}
          />
        </div>
      </div>
    )
  }
}

export default InvitationsTable
