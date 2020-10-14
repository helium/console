import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import moment from 'moment'
import get from 'lodash/get'
import LabelTag from '../common/LabelTag'
import UserCan from '../common/UserCan'
import { updateDevice } from '../../actions/device'
import { redForTablesDeleteText } from '../../util/colors'
import DevicesImg from '../../../img/devices.svg'

import classNames from 'classnames';
import { Table, Button, Empty, Pagination, Typography, Select, Card, Popover, Switch, Checkbox } from 'antd';
const { Text } = Typography
const { Option } = Select

const columnKeyNameText = {
  dev_eui: "Device EUI",
  labels: "Labels",
  channels: "Integrations",
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
    page: 1,
    selectedRows: [],
    allSelected: false,
    columnsToShow: {
      dev_eui: true,
      labels: true,
      channels: true,
      frame_up: true,
      frame_down: true,
      total_packets: true,
      dc_usage: true,
      inserted_at: true,
      last_connected: true,
    },
  }

  componentDidMount() {
    const columnsToShow = localStorage.getItem("columnsToShow")
    if (columnsToShow) {
      this.setState({ columnsToShow: JSON.parse(columnsToShow) })
    }
  }

  handleSelectOption = (value) => {
    if (value === 'addLabel') {
      this.props.openDevicesAddLabelModal(this.state.selectedRows)
    } else if (value === 'removeAllLabels') {
      this.props.openDeviceRemoveAllLabelsModal(this.state.selectedRows)
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
    if (column == sorter.columnKey && order == 'asc') {
      this.props.handleSortChange(column, 'desc')
    }
    if (column == sorter.columnKey && order == 'desc') {
      this.props.handleSortChange(column, 'asc')
    }
    if (column != sorter.columnKey) {
      this.props.handleSortChange(sorter.columnKey, 'asc')
    }
  }

  updateColumns = (key, checked) => {
    const { columnsToShow } = this.state
    const updatedColumnsToShow = Object.assign({}, columnsToShow, { [key]: checked })
    this.setState({ columnsToShow: updatedColumnsToShow })
    localStorage.setItem('columnsToShow', JSON.stringify(updatedColumnsToShow))
  }

  render() {
    const columns = [
      {
        title: 'Device Name',
        dataIndex: 'name',
        sorter: true,
        render: (text, record) => <Link to={`/devices/${record.id}`}>{text}</Link>
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
              labels.map(l => (
                <UserCan
                  key={l.id}
                  alternate={
                    <LabelTag
                      key={l.name}
                      text={l.name}
                      color={l.color}
                      hasIntegrations={l.channels.length > 0}
                      hasFunction={l.function}
                    />
                  }
                >
                  <LabelTag
                    key={l.name}
                    text={l.name}
                    color={l.color}
                    closable
                    hasIntegrations={l.channels.length > 0}
                    hasFunction={l.function}
                    onClose={e => {
                      e.preventDefault()
                      e.stopPropagation()
                      this.props.openDevicesRemoveLabelModal([l], record)
                    }}
                  />
                </UserCan>
              ))
            }
          </React.Fragment>
        }
      },
      {
        title: 'Integrations',
        dataIndex: 'channels',
        render: (text, record) => (
          <div>
            {
              record.channels.map((c, i) => <Text key={c.id}>{c.name}{i != record.channels.length - 1 && ", "}</Text>)
            }
          </div>
        )
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
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
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

    const { noDevicesButton, devices, onChangePageSize } = this.props;

    const rowSelection = {
      onChange: (keys, selectedRows) => this.setState({ selectedRows, allSelected: false }),
      onSelectAll: () => this.setState({allSelected: !this.state.allSelected})
    }

    return (
      <div>
        {
          devices.entries.length === 0 && (
            <div className="blankstateWrapper">
            <div className="message">
              <img src={DevicesImg} />
              <h1>No Devices</h1>
              <p>You haven’t added any devices yet.</p>
              { noDevicesButton() }
            </div>
            <style jsx>{`

                .message {

                  width: 100%;
                  max-width: 500px;
                  margin: 0 auto;
                  text-align: center;

                }

                h1, p  {

                  color: #242425;
                }
                h1 {
                  font-size: 46px;
                  margin-bottom: 10px;
                  font-weight: 600;
                  margin-top: 10px;
                }
                p {
                  font-size: 20px;
                  font-weight: 300;
                  margin-bottom: 30px;
                }


                .blankstateWrapper {
                  width: 100%;
                  padding-top: 200px;
                  margin: 0 auto;
                  position: relative;
                  padding-bottom: 200px;


                }
              `}</style>
            </div>
          )
        }
        {
          devices.entries.length > 0 && (
            <Card
              bodyStyle={{ padding: 0, paddingTop: 1, overflowX: 'scroll' }}
              title={`${devices.totalEntries} Devices`}
              extra={
                <div>
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
                  <Select
                    value={`${devices.pageSize} results`}
                    onSelect={onChangePageSize}
                    style={{marginRight: 10}}
                  >
                    <Option value={10}>10</Option>
                    <Option value={25}>25</Option>
                    <Option value={100}>100</Option>
                  </Select>
                  <UserCan>
                    <Select
                      value="Quick Action"
                      style={{ width: 270, marginRight: 10 }}
                      onSelect={this.handleSelectOption}
                    >
                      <Option value="addLabel" disabled={this.state.selectedRows.length == 0}>Add Label to Selected Devices</Option>
                      <Option value="removeAllLabels" disabled={this.state.selectedRows.length == 0}>Remove All Labels From Selected Devices</Option>
                      <Option value="delete" disabled={this.state.selectedRows.length == 0} style={{ color: redForTablesDeleteText }}>Delete Selected Devices</Option>
                    </Select>
                  </UserCan>
                </div>
              }
            >
            <React.Fragment>
              <Table
                columns={columns}
                dataSource={devices.entries}
                rowKey={record => record.id}
                pagination={false}
                rowSelection={rowSelection}
                onChange={this.handleSort}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 0}}>
                <Pagination
                  current={devices.pageNumber}
                  pageSize={devices.pageSize}
                  total={devices.totalEntries}
                  onChange={page => this.handleChangePage(page)}
                  style={{marginBottom: 20}}
                />
              </div>
            </React.Fragment>
            </Card>
          )
        }
      </div>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ updateDevice }, dispatch)
}

export default DeviceIndexTable
