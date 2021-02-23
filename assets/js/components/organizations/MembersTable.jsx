import React, { Component } from 'react'
import { connect } from 'react-redux';
import get from 'lodash/get'
import moment from 'moment'
import { PAGINATED_MEMBERSHIPS } from '../../graphql/memberships'
import analyticsLogger from '../../util/analyticsLogger'
import UserCan from '../common/UserCan'
import RoleName from '../common/RoleName'
import withGql from '../../graphql/withGql'
import { Table, Button, Empty, Pagination, Tag, Typography } from 'antd';
import { DeleteOutlined } from '@ant-design/icons'
import { SkeletonLayout } from '../common/SkeletonLayout';
const { Text } = Typography

class MembersTable extends Component {
  state = {
    page: 1,
    pageSize: 10
  }

  componentDidMount() {
    const { socket, currentOrganizationId } = this.props

    this.channel = socket.channel("graphql:members_table", {})
    this.channel.join()
    this.channel.on(`graphql:members_table:${currentOrganizationId}:member_list_update`, (message) => {
      this.props.paginatedMembersQuery.refetch()
    })
  }

  componentWillUnmount() {
    this.channel.leave()
  }

  handleChangePage = (page) => {
    this.setState({ page })

    const { pageSize } = this.state
    this.refetchPaginatedEntries(page, pageSize)
  }

  refetchPaginatedEntries = (page, pageSize) => {
    const { refetch } = this.props.paginatedMembersQuery
    refetch({ page, pageSize })
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
        render: text => <RoleName role={text} />
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
            <UserCan noManager>
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
                  icon={<DeleteOutlined />}
                  shape="circle"
                />
              </div>
            </UserCan>
          )
        }
      },
    ]

    const { loading, error, memberships } = this.props.paginatedMembersQuery

    if (loading) return <SkeletonLayout />;
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
          style={{ minWidth: 800 }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end'}}>
          <Pagination
            current={memberships.pageNumber}
            pageSize={memberships.pageSize}
            total={memberships.totalEntries}
            onChange={page => this.handleChangePage(page)}
            style={{ marginBottom: 20 }}
            showSizeChanger={false}
          />
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    socket: state.apollo.socket,
    currentOrganizationId: state.organization.currentOrganizationId,
  }
}

export default connect(mapStateToProps, null)(
  withGql(MembersTable, PAGINATED_MEMBERSHIPS, props => ({ fetchPolicy: 'cache-first', variables: { page: 1, pageSize: 10 }, name: 'paginatedMembersQuery' }))
)
