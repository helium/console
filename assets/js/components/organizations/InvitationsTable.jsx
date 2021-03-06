import React, { Component } from 'react'
import { connect } from 'react-redux';
import get from 'lodash/get'
import moment from 'moment'
import { PAGINATED_INVITATIONS } from '../../graphql/invitations'
import analyticsLogger from '../../util/analyticsLogger'
import UserCan from '../common/UserCan'
import RoleName from '../common/RoleName'
import withGql from '../../graphql/withGql'
import { Table, Button, Empty, Pagination, Tag } from 'antd';
import { DeleteOutlined } from '@ant-design/icons'
import { SkeletonLayout } from '../common/SkeletonLayout';

class InvitationsTable extends Component {
  state = {
    page: 1,
    pageSize: 10
  }

  componentDidMount() {
    const { socket, currentOrganizationId } = this.props

    this.channel = socket.channel("graphql:invitations_table", {})
    this.channel.join()
    this.channel.on(`graphql:invitations_table:${currentOrganizationId}:invitation_list_update`, (message) => {
      this.props.paginatedInvitesQuery.refetch()
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
    const { refetch } = this.props.paginatedInvitesQuery
    refetch({ page, pageSize })
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
                icon={<DeleteOutlined />}
                shape="circle"
              />
            </div>
          </UserCan>
        )
      },
    ]

    const { loading, error, invitations } = this.props.paginatedInvitesQuery

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
          style={{ minWidth: 800 }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end'}}>
          <Pagination
            current={invitations.pageNumber}
            pageSize={invitations.pageSize}
            total={invitations.totalEntries}
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
    currentOrganizationId: state.organization.currentOrganizationId,
    socket: state.apollo.socket,
  }
}

export default connect(mapStateToProps, null)(
  withGql(InvitationsTable, PAGINATED_INVITATIONS, props => ({ fetchPolicy: 'cache-first', variables: { page: 1, pageSize: 10 }, name: 'paginatedInvitesQuery' }))
)
