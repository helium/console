import React, { Component } from 'react'
import { connect } from 'react-redux';
import get from 'lodash/get'
import moment from 'moment'
import { PAGINATED_MEMBERSHIPS, MEMBERSHIP_SUBSCRIPTION } from '../../graphql/memberships'
import analyticsLogger from '../../util/analyticsLogger'
import UserCan from '../common/UserCan'
import { graphql } from 'react-apollo';
import { Table, Button, Empty, Pagination, Tag, Typography } from 'antd';
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

@connect(mapStateToProps, null)
@graphql(PAGINATED_MEMBERSHIPS, queryOptions)
class MembersTable extends Component {
  state = {
    page: 1,
    pageSize: get(this.props.data, ['variables', 'pageSize']) || 10
  }

  componentDidMount() {
    const { subscribeToMore } = this.props.data

    subscribeToMore({
      document: MEMBERSHIP_SUBSCRIPTION,
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
    const { email } = this.props.user
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
        render: (text, record) => {
          if (email === record.email) return (
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Text>You</Text>
            </div>
          )
          return (
            <UserCan>
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                <Button
                  onClick={() => {
                    analyticsLogger.logEvent("ACTION_OPEN_EDIT_MEMBERSHIP", {"email": record.email})
                    this.props.openEditMembershipModal(record)
                  }}
                  style={{ marginRight: 5 }}
                  type="primary"
                >
                  Edit
                </Button>

                <Button
                  onClick={() => {
                    analyticsLogger.logEvent("ACTION_OPEN_DELETE_USER", {"email": record.email})
                    this.props.openDeleteUserModal(record, "membership")
                  }}
                  type="danger"
                  icon="delete"
                />
              </div>
            </UserCan>
          )
        }
      },
    ]

    const { loading, error, memberships } = this.props.data

    if (loading) return null;
    if (error) return (
      <Text>Data failed to load, please reload the page and try again</Text>
    )

    return (
      <div>
        <Table
          columns={columns}
          dataSource={memberships.entries}
          rowKey={record => record.id}
          pagination={false}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end'}}>
          <Pagination
            current={memberships.pageNumber}
            pageSize={memberships.pageSize}
            total={memberships.totalEntries}
            onChange={page => this.handleChangePage(page)}
            style={{ marginBottom: 20 }}
          />
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    user: state.user
  }
}

const Role = (props) => {
  switch(props.role) {
    case 'admin':
      return <span>Administrator</span>
    case 'manager':
      return <span>Manager</span>
    case 'read':
      return <span>Read-Only</span>
    default:
      return <span>{props.role}</span>
  }
}

export default MembersTable
