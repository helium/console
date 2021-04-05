import React, { Component } from 'react'
import withGql from '../../../graphql/withGql'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Link } from 'react-router-dom';
import moment from 'moment'
import UserCan from '../../common/UserCan'
import { redForTablesDeleteText } from '../../../util/colors'
import { updateDevice, setDevicesActive } from '../../../actions/device'
import { updateLabel, addDevicesToLabels, updateLabelNotificationSettings, updateLabelNotificationWebhooks } from '../../../actions/label'
import { PAGINATED_DEVICES_BY_LABEL } from '../../../graphql/devices'
import DeleteDeviceModal from '../../devices/DeleteDeviceModal';
import UpdateLabelModal from '../../labels/UpdateLabelModal'
import { Card, Button, Typography, Table, Pagination, Select, Popover, Switch, Tooltip, Row } from 'antd';
import { StatusIcon } from '../../common/StatusIcon'
import { DeleteOutlined, SettingOutlined } from '@ant-design/icons'
import { SkeletonLayout } from '../../common/SkeletonLayout';
import RemoveDevicesFromLabelModal from '../../labels/RemoveDevicesFromLabelModal'
import { LABEL_SHOW } from '../../../graphql/labels';
const { Text } = Typography
const { Option } = Select
const DEFAULT_COLUMN = "name"
const DEFAULT_ORDER = "asc"

class GroupContent extends Component {
  state = {
    page: 1,
    pageSize: 10,
    selectedRows: [],
    column: DEFAULT_COLUMN,
    order: DEFAULT_ORDER,
    showRemoveDevicesFromLabelModal: false,
    selectedDevices: [],
    showRemoveDevicesFromLabelModal: false,
    showDeleteDeviceModal: false,
    showUpdateLabelModal: false,
    showLabelAddDeviceModal: false
  }

  componentDidMount() {
    const { socket, id } = this.props

    this.channel = socket.channel("graphql:label_show_table", {})
    this.channel.join()
    this.channel.on(`graphql:label_show_table:${id}:update_label_devices`, (message) => {
      const { page, pageSize, column, order } = this.state
      this.refetchPaginatedEntries(page, pageSize, column, order)
    })

    if (!this.props.paginatedDevicesQuery.loading) {
      const { page, pageSize, column, order } = this.state
      this.refetchPaginatedEntries(page, pageSize, column, order)
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      this.channel.on(`graphql:label_show:${this.props.id}:label_update`, (message) => {
        this.props.labelQuery.refetch()
      })
    }
  }

  componentWillUnmount() {
    this.channel.leave()
  }

  handleSelectOption = value => {
    if (value === 'remove') {
      this.openRemoveDevicesFromLabelModal(this.state.selectedDevices)
    } else if (value === 'addDevices') {
      this.openLabelAddDeviceModal()
    } else if (value === 'setActive') {
      this.props.setDevicesActive(this.state.selectedDevices.map(r => r.id), true, this.props.labelId)
    } else if (value === 'setInactive') {
      this.props.setDevicesActive(this.state.selectedDevices.map(r => r.id), false, this.props.labelId)
    } else if (value === 'delete') {
      this.openDeleteDeviceModal(this.state.selectedDevices)
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

  setDevicesSelected = (selectedDevices) => {
    this.setState({selectedDevices});
  }

  openRemoveDevicesFromLabelModal = selectedDevices => {
    this.setState({ showRemoveDevicesFromLabelModal: true, selectedDevices })
  }

  closeRemoveDevicesFromLabelModal = () => {
    this.setState({ showRemoveDevicesFromLabelModal: false })
  }

  openRemoveDevicesFromLabelModal = selectedDevices => {
    this.setState({ showRemoveDevicesFromLabelModal: true, selectedDevices })
  }

  openDeleteDeviceModal = selectedDevices => {
    this.setState({ showDeleteDeviceModal: true, selectedDevices })
  }

  closeDeleteDeviceModal = () => {
    this.setState({ showDeleteDeviceModal: false })
  }

  openLabelAddDeviceModal = () => {
    this.setState({ showLabelAddDeviceModal: true })
  }

  closeLabelAddDeviceModal = () => {
    this.setState({ showLabelAddDeviceModal: false })
  }

  openUpdateLabelModal = () => {
    this.setState({ showUpdateLabelModal: true })
  }

  closeUpdateLabelModal = () => {
    this.setState({ showUpdateLabelModal: false })
  }

  handleUpdateLabel = (name, color) => {
    const labelId = this.props.id
    const attrs = name ? { name, color } : { color }
    this.props.updateLabel(labelId, attrs)
  }

  handleUpdateLabelMultiBuy = multiBuyValue => {
    const labelId = this.props.id
    const attrs = { multi_buy: multiBuyValue }
    this.props.updateLabel(labelId, attrs)
  }

  handleUpdateAdrSetting = adrValue => {
    const labelId = this.props.id
    const attrs = { adr_allowed: adrValue }
    this.props.updateLabel(labelId, attrs)
  }

  handleUpdateLabelNotificationSettings = notifications => {
    this.props.updateLabelNotificationSettings(notifications);
  }

  handleUpdateLabelNotificationWebhooks = webhooks => {
    this.props.updateLabelNotificationWebhooks(webhooks);
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
                  this.openRemoveDevicesFromLabelModal([record])
                }}
              />
            </UserCan>
          </div>
        )
      },
    ]

    const { loading, error, devices_by_label } = this.props.paginatedDevicesQuery;
    const { label } = this.props.labelQuery;
    const { showDeleteDeviceModal } = this.state;

    if (loading) return null; // TODO add skeleton
    if (error) return (
      <Text>Data failed to load, please reload the page and try again</Text>
    )

    const rowSelection = {
      onChange: (keys, selectedRows) => {
        this.setDevicesSelected(selectedRows);
      }
    }

    const { selectedDevices } = this.state

    return (
      <React.Fragment>
        <Text style={{ fontSize: 30, fontWeight: 'bold', display: 'block' }}>{label.name}</Text>
        <Text style={{ fontWeight: 'bold' }}>Last Modified: </Text><Text>{moment.utc(label.updated_at).local().format('l LT')}</Text>
        <div style={{ marginTop: 10 }}>
          <UserCan>
            <Button
              icon={<SettingOutlined />}
              style={{ borderRadius: 4, marginRight: 10, marginBottom: 10 }}
              onClick={this.openUpdateLabelModal}
            >
              Settings
            </Button>
          </UserCan>
        </div>
        <Card title="Grouped Devices">
          <Select
            value="Quick Action"
            style={{ width: 295 }}
            onSelect={this.handleSelectOption}
          >
            <Option value="addDevices">Add this Label to a Device</Option>
            {
              selectedDevices.find(r => r.active === false) && (
                <Option value="setActive" disabled={selectedDevices.length === 0}>Resume Packet Transfer for Selected Devices</Option>
              )
            }

            {
              (selectedDevices.length === 0 || !selectedDevices.find(r => r.active === false)) && (
                <Option value="setInactive" disabled={selectedDevices.length === 0}>Pause Packet Transfer for Selected Devices</Option>
              )
            }
            <Option disabled={selectedDevices.length === 0} value="remove" style={{ color: redForTablesDeleteText }}>Remove Selected Devices from Label</Option>
            <Option value="delete" disabled={selectedDevices.length === 0} style={{ color: redForTablesDeleteText }}>Delete Selected Devices</Option>
          </Select>
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
            style={{ maxHeight: 400, overflow: 'scroll' }}
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
      </Card>
      <RemoveDevicesFromLabelModal
        label={label}
        open={this.state.showRemoveDevicesFromLabelModal}
        onClose={this.closeRemoveDevicesFromLabelModal}
        devicesToRemove={this.state.selectedDevices}
      />
      <DeleteDeviceModal
          label={label}
          open={showDeleteDeviceModal}
          onClose={this.closeDeleteDeviceModal}
          allDevicesSelected={false}
          devicesToDelete={selectedDevices}
          totalDevices={selectedDevices.length}
        />
      <UpdateLabelModal
        handleUpdateLabel={this.handleUpdateLabel}
        handleUpdateLabelMultiBuy={this.handleUpdateLabelMultiBuy}
        handleUpdateAdrSetting={this.handleUpdateAdrSetting}
        handleUpdateLabelNotificationSettings={this.handleUpdateLabelNotificationSettings}
        handleUpdateLabelNotificationWebhooks={this.handleUpdateLabelNotificationWebhooks}
        open={this.state.showUpdateLabelModal}
        onClose={this.closeUpdateLabelModal}
        label={label}
      />
      </React.Fragment>
    )
  }
}

function mapStateToProps(state) {
  return {
    socket: state.apollo.socket,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ updateDevice, setDevicesActive, addDevicesToLabels, updateLabel, updateLabelNotificationSettings, updateLabelNotificationWebhooks }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(
  withGql(
    withGql(GroupContent, 
      PAGINATED_DEVICES_BY_LABEL, props => ({ fetchPolicy: 'cache-first', variables: { page: 1, pageSize: 10, labelId: props.id, column: DEFAULT_COLUMN, order: DEFAULT_ORDER }, name: 'paginatedDevicesQuery' })),
      LABEL_SHOW, props => ({ fetchPolicy: 'cache-first', variables: { id: props.id }, name: 'labelQuery' })
  )
)