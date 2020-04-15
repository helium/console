import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import get from 'lodash/get'
import LabelTag from '../common/LabelTag'
import UserCan from '../common/UserCan'
import { PAGINATED_FUNCTIONS, FUNCTION_SUBSCRIPTION } from '../../graphql/functions'
import analyticsLogger from '../../util/analyticsLogger'
import { graphql } from 'react-apollo';
import { Table, Button, Pagination, Typography, Card, Switch } from 'antd';
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

@graphql(PAGINATED_FUNCTIONS, queryOptions)
class FunctionIndexTable extends Component {
  state = {
    page: 1,
    pageSize: get(this.props.data, ['variables', 'pageSize']) || 10,
  }

  componentDidMount() {
    const { subscribeToMore } = this.props.data

    subscribeToMore({
      document: FUNCTION_SUBSCRIPTION,
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
        title: 'Name',
        dataIndex: 'name',
        render: (text, record) => <Link to="#">{text}</Link>
      },
      {
        title: 'Type',
        dataIndex: 'format',
      },
      {
        title: 'Applied To',
        dataIndex: 'type',
      },
      {
        title: '',
        dataIndex: 'active',
        render: (text, record) => (
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center'}}>
            <UserCan>
              <Switch
                checked={record.active}
                onChange={(value, e) => e.stopPropagation()}
              />
              <Button
                type="danger"
                icon="delete"
                shape="circle"
                style={{ marginLeft: 10 }}
                onClick={e => {
                  e.stopPropagation()

                }}
              />
            </UserCan>
          </div>
        )
      }
    ]

    const { functions, loading, error } = this.props.data

    if (loading) return null;
    if (error) return (
      <Text>Data failed to load, please reload the page and try again</Text>
    )

    return (
      <Card
        bodyStyle={{ padding: 0, paddingTop: 1, overflowX: 'scroll' }}
        title={`${functions.entries.length} Functions`}
      >
        <Table
          onRow={(record, rowIndex) => ({
            onClick: () => this.props.history.push(`/functions/${record.id}`)
          })}
          columns={columns}
          dataSource={functions.entries}
          rowKey={record => record.id}
          pagination={false}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 0}}>
          <Pagination
            current={functions.pageNumber}
            pageSize={functions.pageSize}
            total={functions.totalEntries}
            onChange={page => this.handleChangePage(page)}
            style={{marginBottom: 20}}
          />
        </div>
      </Card>
    )
  }
}

export default FunctionIndexTable
