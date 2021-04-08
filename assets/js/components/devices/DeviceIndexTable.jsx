import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import moment from 'moment'
import get from 'lodash/get'
import LabelTag from '../common/LabelTag'
import UserCan from '../common/UserCan'
import { updateDevice, setDevicesActive } from '../../actions/device'
import { redForTablesDeleteText } from '../../util/colors'
import classNames from 'classnames';
import { Table, Button, Empty, Pagination, Typography, Select, Card, Popover, Switch, Checkbox, Tooltip } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { StatusIcon } from '../common/StatusIcon'
const { Text } = Typography
const { Option } = Select

const columnKeyNameText = {
  dev_eui: "Device EUI",
  labels: "Labels",
  frame_up: "Frame Up",
  frame_down: "Frame Down",
  total_packets: "Packets Transferred",
  dc_usage: "DC Used",
  inserted_at: "Date Activated",
  last_connected: "Last Connected",
}

@connect(null, mapDispatchToProps)
class DeviceIndexTable extends Component {
  state = {
    selectedRows: [],
    allSelected: false,
    columnsToShow: {
      dev_eui: true,
      labels: true,
      frame_up: true,
      frame_down: true,
      total_packets: true,
      dc_usage: true,
      inserted_at: true,
      last_connected: true,
    },
  }

  componentDidMount() {
    const columnsToShow = localStorage.getItem(`columnsToShow-${this.props.userEmail}`)
    if (columnsToShow) {
      this.setState({ columnsToShow: JSON.parse(columnsToShow) })
    }

    this.props.handleChangePage(1) // this refetches the table when switching back from label show
  }

  handleSelectOption = (value) => {
    if (value === 'addLabel') {
      this.props.openDevicesAddLabelModal(this.state.selectedRows)
    } else if (value === 'removeAllLabels') {
      this.props.openDeviceRemoveAllLabelsModal(this.state.selectedRows)
    } else if (value === 'setActive') {
      this.props.setDevicesActive(this.state.selectedRows.map(r => r.id), true)
    } else if (value === 'setInactive') {
      this.props.setDevicesActive(this.state.selectedRows.map(r => r.id), false)
    } else {
      this.props.openDeleteDeviceModal(this.state.selectedRows)
    }
  }

  handleChangePage = (page) => {
    this.setState({ selectedRows: [] });
    this.props.handleChangePage(page);
  }

  toggleDeviceActive = (active, id) => {
    this.props.updateDevice(id, { active })
  }

  handleSort = (pagi, filter, sorter) => {
    const { order, column } = this.props

    if (column == sorter.field && order == 'asc') {
      this.props.handleSortChange(column, 'desc')
    }
    if (column == sorter.field && order == 'desc') {
      this.props.handleSortChange(column, 'asc')
    }
    if (column != sorter.field) {
      this.props.handleSortChange(sorter.field, 'asc')
    }
  }

  updateColumns = (key, checked) => {
    const { columnsToShow } = this.state
    const updatedColumnsToShow = Object.assign({}, columnsToShow, { [key]: checked })
    this.setState({ columnsToShow: updatedColumnsToShow })
    localStorage.setItem(`columnsToShow-${this.props.userEmail}`, JSON.stringify(updatedColumnsToShow))
  }

  render() {
    const { history } = this.props
    const columns = [
      {
        title: 'Device Name',
        dataIndex: 'name',
        sorter: true,
        render: (text, record) => (
          <Link className={record.labels.length === 0 ? 'dull' : undefined} to={`/devices/${record.id}`}>
            {text}
            {
              moment().utc().local().subtract(1, 'days').isBefore(moment.utc(record.last_connected).local()) &&
                <StatusIcon tooltipTitle='Last connected within the last 24h' />
            }
          </Link>
        )
      },
      {
        title: 'Device EUI',
        dataIndex: 'dev_eui',
        sorter: true,
        render: (text, record) => <Text code>{text}</Text>
      },
      {
        title: 'Labels',
        dataIndex: 'labels',
        render: (labels, record) => {
          return <React.Fragment>
            {
              labels.length > 0 ? labels.map(l => (
                <UserCan
                  key={l.id}
                  alternate={
                    <LabelTag
                      key={l.name}
                      text={l.name}
                      color={l.color}
                    />
                  }
                >
                  <LabelTag
                    key={l.name}
                    text={l.name}
                    color={l.color}
                    closable
                    onClose={e => {
                      e.preventDefault()
                      this.props.openDevicesRemoveLabelModal([l], record)
                    }}
                  />
                </UserCan>
              )) : <Text type="danger">None</Text>
            }
          </React.Fragment>
        }
      },
      {
        title: 'Frame Up',
        sorter: true,
        dataIndex: 'frame_up',
      },
      {
        title: 'Frame Down',
        sorter: true,
        dataIndex: 'frame_down',
      },
      {
        title: 'Packets Transferred',
        sorter: true,
        dataIndex: 'total_packets',
      },
      {
        title: 'DC Used',
        sorter: true,
        dataIndex: 'dc_usage'
      },
      {
        title: 'Date Activated',
        dataIndex: 'inserted_at',
        sorter: true,
        render: data => moment.utc(data).local().format('lll')
      },
      {
        title: 'Last Connected',
        dataIndex: 'last_connected',
        sorter: true,
        render: data => data ? moment.utc(data).local().format('lll') : ""
      },
      {
        title: '',
        key: 'action',
        render: (text, record) => (
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center'}}>
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
                  this.props.openDeleteDeviceModal([record])
                }}
              />
            </UserCan>
          </div>
        )
      },
    ].filter(col => {
      if (col.dataIndex == "name" || col.key == "action") return true
      return this.state.columnsToShow[col.dataIndex]
    })

    const { devices, onChangePageSize, deviceImports } = this.props;

    const rowSelection = {
      onChange: (keys, selectedRows) => this.setState({ selectedRows, allSelected: false }),
      onSelectAll: () => this.setState({allSelected: !this.state.allSelected})
    }

    const { selectedRows } = this.state

    return (
      <div>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: '30px 20px 20px 30px' }}>
          <Text style={{ fontSize: 22, fontWeight: 600 }}>All Devices</Text>
          <div>
            <UserCan>
              <Button
                icon={<PlusOutlined />}
                onClick={this.props.openImportDevicesModal}
                disabled={!(deviceImports && (!deviceImports.entries.length || deviceImports.entries[0].status !== "importing"))}
                style={{marginRight: 10, borderRadius: 4 }}
              >
                Import Devices
              </Button>
            </UserCan>
            <Popover
              trigger="click"
              placement="bottom"
              content={
                <div>
                  {
                    Object.keys(this.state.columnsToShow).map(key => (
                      <div key={key}>
                        <Checkbox
                          onChange={e => this.updateColumns(key, e.target.checked)}
                          checked={this.state.columnsToShow[key]}
                        >
                          {columnKeyNameText[key]}
                        </Checkbox>
                      </div>
                    ))
                  }
                </div>
              }
            >
              <Button style={{marginRight: 10}}>Edit Columns</Button>
            </Popover>
            <UserCan>
              <Select
                value="Quick Action"
                style={{ width: 270, marginRight: 10 }}
                onSelect={this.handleSelectOption}
              >
                <Option value="addLabel" disabled={selectedRows.length === 0}>Add Label to Selected Devices</Option>
                <Option value="removeAllLabels" disabled={selectedRows.length === 0}>Remove All Labels From Selected Devices</Option>
                {
                  selectedRows.find(r => r.active === false) && (
                    <Option value="setActive" disabled={selectedRows.length === 0}>Resume Packet Transfer for Selected Devices</Option>
                  )
                }

                {
                  (selectedRows.length == 0 || !selectedRows.find(r => r.active === false)) && (
                    <Option value="setInactive" disabled={selectedRows.length === 0}>Pause Packet Transfer for Selected Devices</Option>
                  )
                }
                <Option value="delete" disabled={selectedRows.length === 0} style={{ color: redForTablesDeleteText }}>Delete Selected Devices</Option>
              </Select>
            </UserCan>
          </div>
        </div>

        <React.Fragment>
          <Table
            columns={columns}
            dataSource={devices.entries}
            rowKey={record => record.id}
            pagination={false}
            rowSelection={rowSelection}
            onChange={this.handleSort}
            onRow={(record, rowIndex) => ({
              onClick: e => {
                this.props.history.push(`/devices/${record.id}`)
              }
            })}
            rowClassName="clickable-row"
            style={{ minWidth: 800, overflowX: 'scroll', overflowY: 'hidden' }}
          />
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 0}}>
            <Select
              value={`${devices.pageSize} results`}
              onSelect={onChangePageSize}
              style={{ marginRight: 40, paddingTop: 2 }}
            >
              <Option value={10}>10</Option>
              <Option value={25}>25</Option>
              <Option value={100}>100</Option>
            </Select>
            <Pagination
              current={devices.pageNumber}
              pageSize={devices.pageSize}
              total={devices.totalEntries}
              onChange={page => this.handleChangePage(page)}
              style={{marginBottom: 20}}
              showSizeChanger={false}
            />
          </div>
        </React.Fragment>
      </div>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ updateDevice, setDevicesActive }, dispatch)
}

export default DeviceIndexTable
