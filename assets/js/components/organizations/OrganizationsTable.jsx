import React, { Component } from 'react'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import moment from 'moment'
import numeral from 'numeral'
import get from 'lodash/get'
import filter from 'lodash/filter'
import { switchOrganization, deleteOrganization, updateOrganization } from '../../actions/organization'
import { PAGINATED_ORGANIZATIONS, ORGANIZATION_SUBSCRIPTION } from '../../graphql/organizations'
import analyticsLogger from '../../util/analyticsLogger'
import { graphql } from 'react-apollo';
import { Table, Typography, Button, Empty, Pagination, Switch } from 'antd';
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

  toggleOrgActive = (active, id) => {
    this.props.updateOrganization(id, active)
  }

  render() {
    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
      },
      {
        title: 'Created',
        dataIndex: 'inserted_at',
        render: data => moment(data).format('LL')
      },
      {
        title: 'DC Balance',
        dataIndex: 'dc_balance',
        render: data => numeral(data).format('0,0')
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
                  switchOrganization(record)
                }}
              >
                Switch
              </Button>

              <Button
                type="danger"
                icon="delete"
                shape="circle"
                onClick={() => {
                  if (!record.dc_balance || record.dc_balance < 1) {
                    analyticsLogger.logEvent("ACTION_DELETE_ORG", {"id": record.id })
                    deleteOrganization(record.id)
                  } else {
                    this.props.openDeleteOrganizationModal(record.id)
                  }
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
        <Table columns={columns} dataSource={organizations.entries} pagination={false} rowKey={row => row.id} style={{ minWidth: 700 }}/>
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
    currentOrganizationId: state.organization.currentOrganizationId,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ switchOrganization, deleteOrganization, updateOrganization }, dispatch);
}

export default OrganizationsTable
