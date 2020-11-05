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
import { updateDevice } from '../../actions/device'
import { PAGINATED_DEVICES_BY_LABEL } from '../../graphql/devices'
import { LABEL_UPDATE_SUBSCRIPTION } from '../../graphql/labels'
import { Card, Button, Typography, Table, Pagination, Select, Popover, Switch } from 'antd';
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
      labelId: props.labelId,
      column: DEFAULT_COLUMN,
      order: DEFAULT_ORDER
    },
    fetchPolicy: 'cache-and-network',
  })
}

@connect(null, mapDispatchToProps)
@graphql(PAGINATED_DEVICES_BY_LABEL, queryOptions)
class LabelShowTable extends Component {
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
      document: LABEL_UPDATE_SUBSCRIPTION,
      variables: { id: this.props.labelId },
      updateQuery: (prev, { subscriptionData }) => {
        const { page, pageSize, column, order } = this.state
        if (!subscriptionData.data) return prev
        this.refetchPaginatedEntries(page, pageSize, column, order)
        this.setState({ selectedRows: [] })
      }
    })
  }

  handleSelectOption = () => {
    this.props.openRemoveDevicesFromLabelModal(this.state.selectedRows)
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
        title: 'Device Name',
        dataIndex: 'name',
        sorter: true,
        render: (text, record) => <Link to="#">{text}</Link>
      },
      {
        title: 'Labels',
        dataIndex: 'labels',
        render: (text, record) => (
          <span>
            {
              record.labels.map(l => (
                <LabelTag key={l.name} text={l.name} color={l.color} hasFunction={l.function} hasIntegrations={l.channels.length > 0}/>
              ))
            }
          </span>
        )
      },
      {
        title: 'Date Activated',
        sorter: true,
        dataIndex: 'inserted_at',
        render: data => moment.utc(data).local().format('lll')
      },
      {
        title: '',
        key: 'action',
        render: (text, record) => (
          <div>
            <UserCan>
              <Popover
                content={`This device is currently ${record.active ? "active" : "inactive"}`}
                placement="top"
                overlayStyle={{ width: 140 }}
              >
                <Switch
                  checked={record.active}
                  onChange={(active, e) => {
                    e.stopPropagation()
                    this.toggleDeviceActive(active, record.id)
                  }}
                />
              </Popover>
              <Button
                type="danger"
                icon="delete"
                shape="circle"
                size="small"
                style={{ marginLeft: 8 }}
                onClick={e => {
                  e.stopPropagation()
                  this.props.openRemoveDevicesFromLabelModal([record])
                }}
              />
            </UserCan>
          </div>
        )
      },
    ]

    const { loading, error, devices_by_label } = this.props.data
    const { devicesSelected } = this.props;

    if (loading) return <SkeletonLayout />;
    if (error) return (
      <Text>Data failed to load, please reload the page and try again</Text>
    )

    const rowSelection = {
      onChange: (keys, selectedRows) => {
        this.setState({ selectedRows });
        devicesSelected(selectedRows);
      }
    }

    return (
      <Card
        bodyStyle={{ padding: 0, paddingTop: 1, overflowX: 'scroll' }}
        title={`${devices_by_label.totalEntries} Devices`}
        extra={
          <UserCan>
            <Select
              value="Quick Action"
              style={{ width: 300 }}
              onSelect={this.handleSelectOption}
            >
              <Option disabled={this.state.selectedRows.length == 0} value="remove" style={{ color: redForTablesDeleteText }}>Remove Selected Devices from Label</Option>
            </Select>
          </UserCan>
        }
      >
        <Table
          onRow={(record, rowIndex) => ({
            onClick: () => this.props.history.push(`/devices/${record.id}`)
          })}
          columns={columns}
          dataSource={devices_by_label.entries}
          rowKey={record => record.id}
          pagination={false}
          rowSelection={rowSelection}
          onChange={this.handleSortChange}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 0}}>
          <Pagination
            current={devices_by_label.pageNumber}
            pageSize={devices_by_label.pageSize}
            total={devices_by_label.totalEntries}
            onChange={page => this.handleChangePage(page)}
            style={{marginBottom: 20}}
          />
        </div>
      </Card>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ updateDevice }, dispatch)
}

export default LabelShowTable
