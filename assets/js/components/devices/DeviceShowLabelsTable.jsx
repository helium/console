import React, { Component } from 'react'
import withGql from '../../graphql/withGql'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom';
import moment from 'moment'
import get from 'lodash/get'
import LabelTag from '../common/LabelTag'
import UserCan from '../common/UserCan'
import { PAGINATED_LABELS_BY_DEVICE } from '../../graphql/labels'
import { Card, Button, Typography, Table, Pagination } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { SkeletonLayout } from '../common/SkeletonLayout';
const { Text } = Typography
const DEFAULT_COLUMN = "name"
const DEFAULT_ORDER = "asc"

class DeviceShowLabelsTable extends Component {
  state = {
    page: 1,
    pageSize: 10,
    selectedRows: [],
    column: DEFAULT_COLUMN,
    order: DEFAULT_ORDER
  }

  componentDidMount() {
    const { deviceId, socket } = this.props

    this.channel = socket.channel("graphql:device_show_labels_table", {})
    this.channel.join()
    this.channel.on(`graphql:device_show_labels_table:${deviceId}:device_update`, (message) => {
      const { page, pageSize, column, order } = this.state
      this.refetchPaginatedEntries(page, pageSize, column, order)
    })
  }

  componentWillUnmount() {
    this.channel.leave()
  }

  handleChangePage = (page) => {
    this.setState({ page })

    const { pageSize, column, order } = this.state
    this.refetchPaginatedEntries(page, pageSize, column, order)
  }

  refetchPaginatedEntries = (page, pageSize, column, order) => {
    const { refetch } = this.props.paginatedLabelsQuery
    refetch({ page, pageSize, column, order })
  }

  render() {
    const columns = [
      {
        title: 'Labels',
        dataIndex: 'name',
        render: (text, record) => (
          <React.Fragment>
            <Link to="#">{text} </Link><LabelTag text={text} style={{ marginLeft: 10 }} />
          </React.Fragment>
        )
      },
      {
        title: 'Date Activated',
        dataIndex: 'inserted_at',
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

    const { loading, error, labels_by_device } = this.props.paginatedLabelsQuery
    const numOfEntries = labels_by_device && labels_by_device.totalEntries;

    if (loading) return <SkeletonLayout />;
    if (error) return (
      <Text>Data failed to load, please reload the page and try again</Text>
    )

    return (
      <Card
        bodyStyle={{ padding: 0, paddingTop: 1, overflowX: 'scroll' }}
        title={`${numOfEntries} Label${numOfEntries > 1 || numOfEntries === 0 ? 's' : ''} Attached`}
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
          columns={columns}
          dataSource={labels_by_device.entries}
          rowKey={record => record.id}
          pagination={false}
          style={{ minWidth: 800 }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 0}}>
          <Pagination
            current={labels_by_device.pageNumber}
            pageSize={labels_by_device.pageSize}
            total={labels_by_device.totalEntries}
            onChange={page => this.handleChangePage(page)}
            style={{marginBottom: 20}}
            showSizeChanger={false}
          />
        </div>
      </Card>
    )
  }
}

function mapStateToProps(state) {
  return {
    socket: state.apollo.socket,
  }
}

export default connect(mapStateToProps, null)(
  withGql(DeviceShowLabelsTable, PAGINATED_LABELS_BY_DEVICE, props => ({ fetchPolicy: 'cache-first', variables: { page: 1, pageSize: 10, deviceId: props.deviceId, column: DEFAULT_COLUMN, order: DEFAULT_ORDER }, name: 'paginatedLabelsQuery' }))
)
