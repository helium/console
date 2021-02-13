import React, { Component } from 'react'
import { graphql } from 'react-apollo';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Link } from 'react-router-dom';
import moment from 'moment'
import get from 'lodash/get'
import LabelTag from '../common/LabelTag'
import UserCan from '../common/UserCan'
import { redForTablesDeleteText } from '../../util/colors'
import { updateDevice, setDevicesActive } from '../../actions/device'
import { PAGINATED_LABELS_BY_DEVICE } from '../../graphql/labels'
import { DEVICE_UPDATE_SUBSCRIPTION } from '../../graphql/devices'
import { Card, Button, Typography, Table, Pagination, Select, Popover, Switch, Tooltip } from 'antd';
import { StatusIcon } from '../common/StatusIcon'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { SkeletonLayout } from '../common/SkeletonLayout';
const { Text } = Typography
const { Option } = Select


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

@connect(null, mapDispatchToProps)
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

  handleSortChange = (pagi, filter, sorter) => {
    const { page, pageSize, order, column } = this.state

    if (column == sorter.columnKey && order == 'asc') {
      this.setState({ order: 'desc' })
      this.refetchPaginatedEntries(page, pageSize, column, 'desc')
    }
    if (column == sorter.columnKey && order == 'desc') {
      this.setState({ order: 'asc' })
      this.refetchPaginatedEntries(page, pageSize, column, 'asc')
    }
    if (column != sorter.columnKey) {
      this.setState({ column: sorter.columnKey, order: 'asc' })
      this.refetchPaginatedEntries(page, pageSize, sorter.columnKey, 'asc')
    }
  }

  refetchPaginatedEntries = (page, pageSize, column, order) => {
    const { fetchMore } = this.props.data
    fetchMore({
      variables: { page, pageSize, column, order },
      updateQuery: (prev, { fetchMoreResult }) => fetchMoreResult
    })
  }

  toggleDeviceActive = (active, id) => {
    this.props.updateDevice(id, { active })
  }

  render() {
    const columns = [
      {
        title: 'Labels',
        dataIndex: 'name',
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
          // rowSelection={rowSelection}
          onChange={this.handleSortChange}
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

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ updateDevice, setDevicesActive }, dispatch)
}

export default DeviceShowLabelsTable