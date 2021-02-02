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
import UserCan from '../common/UserCan'
import { graphql } from 'react-apollo';
import { Table, Typography, Button, Empty, Pagination, Switch } from 'antd';
import { DeleteOutlined } from '@ant-design/icons'
const { Text } = Typography
import { Query } from 'react-apollo';
import { SkeletonLayout } from '../common/SkeletonLayout';
import WebhookKeyField from './WebhookKeyField';

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
    webhookKeyToShow: 'none'
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
        title: 'Added',
        dataIndex: 'inserted_at',
        render: data => moment(data).format('LL')
      },
      {
        title: 'DC Balance',
        dataIndex: 'dc_balance',
        render: data => numeral(data).format('0,0')
      },
      {
        title: 'Devices',
        dataIndex: 'devices',
        render: (data, record) => {
          return (
            <span>
              <UserCan noManager>
                <Switch
                  checked={record.active}
                  onChange={active => this.toggleOrgActive(active, record.id)}
                  style={{ marginRight: 8 }}
                />
              </UserCan>
              {
                record.active_count > 0 && (
                  <Text style={{ color: '#4091F7' }}>{record.active_count} Active</Text>
                )
              }
              {
                record.inactive_count > 0 && (
                  <Text style={{ color: '#BFBFBF', marginLeft: 8 }}>{record.inactive_count} Inactive</Text>
                )
              }
            </span>
          )
        }
      },
      {
        title: 'Webhook Key',
        key: 'webhook',
        render: (text, record) => (
         <WebhookKeyField data={record.webhook_key} />
        )
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
                size="small"
                onClick={() => {
                  analyticsLogger.logEvent("ACTION_SWITCH_ORG", {"id": record.id })
                  switchOrganization(record)
                }}
              >
                Switch
              </Button>

              <UserCan noManager>
                <Button
                  type="danger"
                  icon={<DeleteOutlined />}
                  shape="circle"
                  size="small"
                  onClick={() => {
                    this.props.openDeleteOrganizationModal(record.id)
                  }}
                />
              </UserCan>
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

    if (loading) return <SkeletonLayout />;
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
