import React, { Component } from 'react'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import moment from 'moment'
import get from 'lodash/get'
import filter from 'lodash/filter'
import { switchOrganization, deleteOrganization } from '../../actions/organization'
import UserCan from '../common/UserCan'
import { PAGINATED_ORGANIZATIONS, ORGANIZATION_SUBSCRIPTION } from '../../graphql/organizations'
import analyticsLogger from '../../util/analyticsLogger'
import { graphql } from 'react-apollo';
import { Table, Typography, Button, Empty, Pagination } from 'antd';
const { Text } = Typography
import { Query } from 'react-apollo';

const queryOptions = {
  options: props => ({
    variables: {
      page: 1,
      pageSize: 10,
    },
    fetchPolicy: 'cache-and-network',
  })
}

@connect(mapStateToProps, mapDispatchToProps)
@graphql(PAGINATED_ORGANIZATIONS, queryOptions)
class OrganizationsTable extends Component {
  state = {
    page: 1,
    pageSize: get(this.props.data, ['variables', 'pageSize']) || 10,
  }

  componentDidMount() {
    const { subscribeToMore, variables } = this.props.data

    subscribeToMore({
      document: ORGANIZATION_SUBSCRIPTION,
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
    const { fetchMore } = this.props.data
    fetchMore({
      variables: { page, pageSize },
      updateQuery: (prev, { fetchMoreResult }) => fetchMoreResult
    })
  }

  render() {
    const columns = [
      {
        title: 'Organization',
        dataIndex: 'name',
      },
      {
        title: 'Created',
        dataIndex: 'inserted_at',
        render: data => moment(data).format('LL')
      },
      {
        title: '',
        key: 'action',
        render: (text, record) => (
          currentOrganizationId !== record.id ? (
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Button
                type="primary"
                style={{ marginRight: 5 }}
                onClick={() => {
                  analyticsLogger.logEvent("ACTION_SWITCH_ORG", {"id": record.id })
                  switchOrganization(record.id)
                }}
              >
                Switch
              </Button>

              <Button
                icon="delete"
                type="danger"
                onClick={() => {
                  analyticsLogger.logEvent("ACTION_DELETE_ORG", {"id": record.id })
                  deleteOrganization(record.id)
                }}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Text>Current</Text>
            </div>
          )
        ),
      },
    ]

    const { currentOrganizationId, switchOrganization, deleteOrganization } = this.props
    const { organizations, loading, error } = this.props.data

    if (loading) return null;
    if (error) return (
      <Text>Data failed to load, please reload the page and try again</Text>
    )

    return (
      <div>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 20 }}>
          <UserCan>
            <Button
              icon="plus"
              onClick={() => {
                analyticsLogger.logEvent("ACTION_NEW_ORG")
                this.props.openOrganizationModal()
              }}
              type="primary"
            >
              Add Organization
            </Button>
          </UserCan>
        </div>
        <Table columns={columns} dataSource={organizations.entries} pagination={false} rowKey={row => row.id}/>
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 0}}>
          <Pagination
            current={organizations.pageNumber}
            pageSize={organizations.pageSize}
            total={organizations.totalEntries}
            onChange={page => this.handleChangePage(page)}
            style={{marginBottom: 20}}
          />
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    currentOrganizationId: state.auth.currentOrganizationId,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ switchOrganization, deleteOrganization }, dispatch);
}

export default OrganizationsTable
