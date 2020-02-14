import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { deleteDevice } from '../../actions/device'
import moment from 'moment'
import find from 'lodash/find'
import get from 'lodash/get'
import UserCan from '../common/UserCan'
import { PAGINATED_DEVICES, DEVICE_SUBSCRIPTION } from '../../graphql/devices'
import analyticsLogger from '../../util/analyticsLogger'
import { Query } from 'react-apollo';
import { Table, Button, Empty, Pagination, Tag } from 'antd';
import EmptyImg from '../../../img/emptydevice.svg'
import { Card } from 'antd';



const defaultVariables = {
  page: 1,
  pageSize: 10
}

@connect(null, mapDispatchToProps)
class DevicesTable extends Component {
  render() {
    const { deleteDevice } = this.props

    const columns = [
      {
        title: 'Device Name',
        dataIndex: 'name',
        render: (text, record) => (
          <Link to={`/devices/${record.id}`}>{text}</Link>
        )
      },
      {
        title: 'Device EUI',
        dataIndex: 'dev_eui',
      },
      {
        title: 'Integrations',
        dataIndex: 'channels',
        render: data => {
          return <React.Fragment>
            {
              data.map(d => <Tag key={d.id}>{d.name}</Tag>)
            }
          </React.Fragment>
        }
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
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Button
              icon="delete"
              type="danger"
              onClick={() => {
                analyticsLogger.logEvent("ACTION_DELETE_DEVICE", { "id": record.id })
                deleteDevice(record.id)
              }}
            />
          </div>
        )
      },
    ]

    return (
      <Query query={PAGINATED_DEVICES} fetchPolicy={'cache-and-network'} variables={defaultVariables}>
        {({ loading, error, data, fetchMore, subscribeToMore, variables }) => (
          <QueryResults
            loading={loading}
            error={error}
            data={data}
            columns={columns}
            fetchMore={fetchMore}
            subscribeToMore={subscribeToMore}
            subscription={DEVICE_SUBSCRIPTION}
            variables={variables}
            {...this.props}
          />
        )}
      </Query>
    )
  }
}

class QueryResults extends Component {
  constructor(props) {
    super(props)

    this.state = {
      page: 1,
      pageSize: get(props, ['variables', 'pageSize']) || 10
    }

    this.handleChangePage = this.handleChangePage.bind(this)
    this.refetchPaginatedEntries = this.refetchPaginatedEntries.bind(this)
    this.handleSubscriptionAdded = this.handleSubscriptionAdded.bind(this)
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

  handleChangePage(page) {
    this.setState({ page })

    const { pageSize } = this.state
    this.refetchPaginatedEntries(page, pageSize)
  }

  handleSubscriptionAdded() {
    const { page, pageSize } = this.state
    this.refetchPaginatedEntries(page, pageSize)
  }

  refetchPaginatedEntries(page, pageSize) {
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
      style={{marginBottom: 70}}
        image={EmptyImg}
        description={<span>No Devices</span>}
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
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 0}}>
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

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ deleteDevice }, dispatch);
}

export default DevicesTable
