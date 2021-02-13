import React, { Component } from 'react'
import { graphql } from 'react-apollo';
import { connect } from 'react-redux'
import { Link } from 'react-router-dom';
import moment from 'moment'
import get from 'lodash/get'
import LabelTag from '../common/LabelTag'
import UserCan from '../common/UserCan'
import { PAGINATED_LABELS_BY_DEVICE } from '../../graphql/labels'
import { DEVICE_UPDATE_SUBSCRIPTION } from '../../graphql/devices'
import { Card, Button, Typography, Table, Pagination } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { SkeletonLayout } from '../common/SkeletonLayout';
const { Text } = Typography


const DEFAULT_COLUMN = "name"
const DEFAULT_ORDER = "asc"

const queryOptions = {
  options: props => ({
    variables: {
      page: 1,
      pageSize: 10,
      deviceId: props.deviceId,
      column: DEFAULT_COLUMN,
      order: DEFAULT_ORDER
    },
    fetchPolicy: 'cache-and-network',
  })
}

@graphql(PAGINATED_LABELS_BY_DEVICE, queryOptions)
class DeviceShowLabelsTable extends Component {
  state = {
    page: 1,
    pageSize: get(this.props.data, ['variables', 'pageSize']) || 10,
    selectedRows: [],
    column: DEFAULT_COLUMN,
    order: DEFAULT_ORDER
  }

  componentDidMount() {
    const { subscribeToMore} = this.props.data

    subscribeToMore({
      document: DEVICE_UPDATE_SUBSCRIPTION,
      variables: { deviceId: this.props.deviceId },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        fetchMore({
          updateQuery: (prev, { fetchMoreResult }) => fetchMoreResult
        })
      }
    })
  }

  handleChangePage = (page) => {
    this.setState({ page })

    const { pageSize, column, order } = this.state
    this.refetchPaginatedEntries(page, pageSize, column, order)
  }

  refetchPaginatedEntries = (page, pageSize, column, order) => {
    const { fetchMore } = this.props.data
    fetchMore({
      variables: { page, pageSize, column, order },
      updateQuery: (prev, { fetchMoreResult }) => fetchMoreResult
    })
  }

  handleSortChange = (pagi, filter, sorter) => {
    const { page, pageSize, order, column } = this.state

    if (column == sorter.field && order == 'asc') {
      this.setState({ order: 'desc' })
      this.refetchPaginatedEntries(page, pageSize, column, 'desc')
    }
    if (column == sorter.field && order == 'desc') {
      this.setState({ order: 'asc' })
      this.refetchPaginatedEntries(page, pageSize, column, 'asc')
    }
    if (column != sorter.field) {
      this.setState({ column: sorter.field, order: 'asc' })
      this.refetchPaginatedEntries(page, pageSize, sorter.field, 'asc')
    }
  }

  render() {
    const columns = [
      {
        title: 'Labels',
        dataIndex: 'name',
        sorter: true,
        render: (text, record) => (
          <React.Fragment>
            <Link to={`/labels/${record.id}`}>{text} </Link><LabelTag text={text} color={record.color} style={{ marginLeft: 10 }} hasIntegrations={record.channels.length > 0} hasFunction={record.function}/>
          </React.Fragment>
        )
      },
      {
        title: 'Associated Integrations',
        dataIndex: 'channels',
        render: (text, record) => {
          return (
          <div>
            {
              record.channels.map(c => (
                <a
                  key={c.id}
                  style={{ marginRight: 8 }}
                  href={`/integrations/${c.id}`}
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.props.history.push(`/integrations/${c.id}`)
                  }}
                >
                  {c.name}
                </a>
              ))
            }
          </div>
        )}
      },
      {
        title: 'Date Activated',
        dataIndex: 'inserted_at',
        sorter: true,
        render: data => moment.utc(data).local().format('lll')
      },
      {
        title: '',
        key: 'action',
        render: (text, record) => (
          <div>
            <UserCan>
              <Button
                type="danger"
                icon={<DeleteOutlined />}
                shape="circle"
                size="small"
                style={{ marginLeft: 8 }}
                onChange={this.handleSortChange}
                onClick={e => {
                  e.stopPropagation()
                  this.props.openRemoveLabelFromDeviceModal([record])
                }}
              />
            </UserCan>
          </div>
        )
      }
    ]

    const { loading, error, labels_by_device } = this.props.data
    const numOfEntries = labels_by_device && labels_by_device.totalEntries;

    if (loading) return <SkeletonLayout />;
    if (error) return (
      <Text>Data failed to load, please reload the page and try again</Text>
    )

    let allIntegrations = labels_by_device && labels_by_device.entries.map(e => (e.channels.map(c => c.id))).flat();
    let numOfUniqueIntegrations = allIntegrations.filter((item, index) => (allIntegrations.indexOf(item) === index)).length;

    return (
      <Card
        bodyStyle={{ padding: 0, paddingTop: 1, overflowX: 'scroll' }}
        title={`${numOfEntries} Label${numOfEntries > 1 || numOfEntries === 0 ? 's' : ''} Attached providing ${numOfUniqueIntegrations} Integration${numOfUniqueIntegrations > 1 || numOfUniqueIntegrations === 0 ? 's' : ''}`}
        extra={
          <Button 
            type="primary" 
            onClick={this.props.openDevicesAddLabelModal}
            icon={<PlusOutlined />}
          >
            Add Label
          </Button>
        }
      >
        <Table
          onRow={(record, rowIndex) => ({
            onClick: () => this.props.history.push(`/labels/${record.id}`)
          })}
          columns={columns}
          dataSource={labels_by_device.entries}
          rowKey={record => record.id}
          pagination={false}
          onChange={this.handleSortChange}
          style={{ minWidth: 800 }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 0}}>
          <Pagination
            current={labels_by_device.pageNumber}
            pageSize={labels_by_device.pageSize}
            total={labels_by_device.totalEntries}
            onChange={page => this.handleChangePage(page)}
            style={{marginBottom: 20}}
          />
        </div>
      </Card>
    )
  }
}

export default DeviceShowLabelsTable