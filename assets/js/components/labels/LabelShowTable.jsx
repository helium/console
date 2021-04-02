import React, { Component } from 'react'
import withGql from '../../graphql/withGql'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Link } from 'react-router-dom';
import moment from 'moment'
import get from 'lodash/get'
import LabelTag from '../common/LabelTag'
import UserCan from '../common/UserCan'
import { redForTablesDeleteText } from '../../util/colors'
import { updateDevice, setDevicesActive } from '../../actions/device'
import { PAGINATED_DEVICES_BY_LABEL } from '../../graphql/devices'
import { Card, Button, Typography, Table, Pagination, Select, Popover, Switch, Tooltip } from 'antd';
import { StatusIcon } from '../common/StatusIcon'
import { DeleteOutlined, SettingOutlined } from '@ant-design/icons'
import { SkeletonLayout } from '../common/SkeletonLayout';
const { Text } = Typography
const { Option } = Select
const DEFAULT_COLUMN = "name"
const DEFAULT_ORDER = "asc"

class LabelShowTable extends Component {
  state = {
    page: 1,
    pageSize: 10,
    selectedRows: [],
    column: DEFAULT_COLUMN,
    order: DEFAULT_ORDER
  }

  componentDidMount() {
    const { socket, labelId } = this.props

    this.channel = socket.channel("graphql:label_show_table", {})
    this.channel.join()
    this.channel.on(`graphql:label_show_table:${labelId}:update_label_devices`, (message) => {
      const { page, pageSize, column, order } = this.state
      this.refetchPaginatedEntries(page, pageSize, column, order)
    })

    if (!this.props.paginatedDevicesQuery.loading) {
      const { page, pageSize, column, order } = this.state
      this.refetchPaginatedEntries(page, pageSize, column, order)
    }
  }

  componentWillUnmount() {
    this.channel.leave()
  }

  handleSelectOption = value => {
    if (value === 'remove') {
      this.props.openRemoveDevicesFromLabelModal(this.state.selectedRows)
    } else if (value === 'addDevices') {
      this.props.openLabelAddDeviceModal()
    } else if (value === 'setActive') {
      this.props.setDevicesActive(this.state.selectedRows.map(r => r.id), true, this.props.labelId)
    } else if (value === 'setInactive') {
      this.props.setDevicesActive(this.state.selectedRows.map(r => r.id), false, this.props.labelId)
    } else if (value === 'delete') {
      this.props.openDeleteDeviceModal(this.state.selectedRows)
    }
  }

  handleChangePage = (page) => {
    this.setState({ page })

    const { pageSize, column, order } = this.state
    this.refetchPaginatedEntries(page, pageSize, column, order)
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

  refetchPaginatedEntries = (page, pageSize, column, order) => {
    const { refetch } = this.props.paginatedDevicesQuery
    refetch({ page, pageSize, column, order })
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
        render: (text, record) => (
          <Link to={`/devices/${record.id}`}>
            {text}
            {
              moment().utc().local().subtract(1, 'days').isBefore(moment.utc(record.last_connected).local()) &&
                <StatusIcon tooltipTitle='Last connected within the last 24h' style={{ marginLeft: "4px" }} {...this.props} />
            }
          </Link>
        )
      },
      {
        title: 'Labels',
        dataIndex: 'labels',
        render: (text, record) => (
          <span>
            {
              record.labels.map(l => (
                <LabelTag key={l.name} text={l.name} color={l.color} />
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
                icon={<DeleteOutlined />}
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

    const { loading, error, devices_by_label } = this.props.paginatedDevicesQuery
    const { devicesSelected, label } = this.props;

    if (loading) return <div style={{ padding: 40 }}><SkeletonLayout /></div>;
    if (error) return (
      <Text>Data failed to load, please reload the page and try again</Text>
    )

    const rowSelection = {
      onChange: (keys, selectedRows) => {
        this.setState({ selectedRows });
        devicesSelected(selectedRows);
      }
    }

    const { selectedRows } = this.state

    return (
      <div>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: '30px 20px 20px 30px' }}>
          <Text style={{ fontSize: 22, fontWeight: 600 }}>{label.name}</Text>
          <div>
            <UserCan>
              <Button
                icon={<SettingOutlined />}
                style={{ borderRadius: 4, marginRight: 10 }}
                onClick={this.props.openUpdateLabelModal}
              >
                Label Settings
              </Button>
              <Select
                value="Quick Action"
                style={{ width: 300 }}
                onSelect={this.handleSelectOption}
              >
                <Option value="addDevices">Add this Label to a Device</Option>
                {
                  selectedRows.find(r => r.active === false) && (
                    <Option value="setActive" disabled={selectedRows.length === 0}>Resume Packet Transfer for Selected Devices</Option>
                  )
                }

                {
                  (selectedRows.length === 0 || !selectedRows.find(r => r.active === false)) && (
                    <Option value="setInactive" disabled={selectedRows.length === 0}>Pause Packet Transfer for Selected Devices</Option>
                  )
                }
                <Option disabled={selectedRows.length === 0} value="remove" style={{ color: redForTablesDeleteText }}>Remove Selected Devices from Label</Option>
                <Option value="delete" disabled={selectedRows.length === 0} style={{ color: redForTablesDeleteText }}>Delete Selected Devices</Option>
              </Select>
            </UserCan>
          </div>
        </div>
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
          style={{ minWidth: 800 }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 0}}>
          <Pagination
            current={devices_by_label.pageNumber}
            pageSize={devices_by_label.pageSize}
            total={devices_by_label.totalEntries}
            onChange={page => this.handleChangePage(page)}
            style={{marginBottom: 20}}
            showSizeChanger={false}
          />
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    socket: state.apollo.socket,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ updateDevice, setDevicesActive }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(
  withGql(LabelShowTable, PAGINATED_DEVICES_BY_LABEL, props => ({ fetchPolicy: 'cache-first', variables: { page: 1, pageSize: 10, labelId: props.labelId, column: DEFAULT_COLUMN, order: DEFAULT_ORDER }, name: 'paginatedDevicesQuery' }))
)
