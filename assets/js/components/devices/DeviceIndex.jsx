import React, { Component } from 'react';
import { connect } from 'react-redux'
import DeviceIndexTable from './DeviceIndexTable';
import DeviceDashboardLayout from './DeviceDashboardLayout';
import DevicesAddLabelModal from './DevicesAddLabelModal';
import DeleteDeviceModal from './DeleteDeviceModal';
import DeviceRemoveLabelModal from './DeviceRemoveLabelModal';
import DeviceRemoveAllLabelsModal from './DeviceRemoveAllLabelsModal';
import { PAGINATED_DEVICES } from '../../graphql/devices';
import withGql from '../../graphql/withGql'
import analyticsLogger from '../../util/analyticsLogger';
import { Typography } from 'antd';
import { MobileDisplay, DesktopDisplay } from '../mobile/MediaQuery'
import { SkeletonLayout } from '../common/SkeletonLayout';
const { Text } = Typography
const DEFAULT_COLUMN = "name"
const DEFAULT_ORDER = "asc"
const PAGE_SIZE_KEY = 'devicePageSize';
let startPageSize = parseInt(localStorage.getItem(PAGE_SIZE_KEY)) || 10;

class DeviceIndex extends Component {
  state = {
    showDeleteDeviceModal: false,
    showDevicesAddLabelModal: false,
    showDevicesRemoveLabelModal: false,
    showDeviceRemoveAllLabelsModal: false,
    devicesSelected: null,
    labelsSelected: null,
    deviceToRemoveLabel: null,
    page: 1,
    pageSize: startPageSize,
    column: DEFAULT_COLUMN,
    order: DEFAULT_ORDER,
    allDevicesSelected: false,
  }

  componentDidMount() {
    analyticsLogger.logEvent("ACTION_NAV_DEVICES_INDEX")
    const { socket, currentOrganizationId, user } = this.props

    this.channel = socket.channel("graphql:devices_index_table", {})
    this.channel.join()
    this.channel.on(`graphql:devices_index_table:${currentOrganizationId}:device_list_update`, (message) => {
      const { page, pageSize, column, order } = this.state
      this.refetchPaginatedEntries(page, pageSize, column, order)
    })

    if (!this.props.devicesQuery.loading) {
      const { page, pageSize, column, order } = this.state
      this.refetchPaginatedEntries(page, pageSize, column, order)
    }
  }

  componentWillUnmount() {
    this.channel.leave()
  }

  openDevicesAddLabelModal = (devicesSelected) => {
    this.setState({ showDevicesAddLabelModal: true, devicesSelected })
    if (devicesSelected.length === this.state.pageSize) {
      this.setState({ allDevicesSelected: true })
    } else {
      this.setState({ allDevicesSelected: false })
    }
  }

  closeDevicesAddLabelModal = () => {
    this.setState({ showDevicesAddLabelModal: false })
  }

  openDeviceRemoveAllLabelsModal = (devicesSelected) => {
    this.setState({ showDeviceRemoveAllLabelsModal: true, devicesSelected })
    if (devicesSelected.length === this.state.pageSize) {
      this.setState({ allDevicesSelected: true })
    } else {
      this.setState({ allDevicesSelected: false })
    }
  }

  closeDeviceRemoveAllLabelsModal = () => {
    this.setState({ showDeviceRemoveAllLabelsModal: false })
  }

  openDevicesRemoveLabelModal = (labelsSelected, deviceToRemoveLabel) => {
    this.setState({ showDevicesRemoveLabelModal: true, labelsSelected, deviceToRemoveLabel })
  }

  closeDevicesRemoveLabelModal = () => {
    this.setState({ showDevicesRemoveLabelModal: false, labelsSelected: null, deviceToRemoveLabel: null })
  }

  openDeleteDeviceModal = (devicesSelected) => {
    this.setState({ showDeleteDeviceModal: true, devicesSelected })
    if (devicesSelected.length === this.state.pageSize) {
      this.setState({ allDevicesSelected: true })
    } else {
      this.setState({ allDevicesSelected: false })
    }
  }

  closeDeleteDeviceModal = () => {
    this.setState({ showDeleteDeviceModal: false })
  }

  handleSortChange = (column, order) => {
    const { page, pageSize } = this.state

    this.setState({ column, order })
    this.refetchPaginatedEntries(page, pageSize, column, order)
  }

  handleChangePage = (page) => {
    this.setState({ page })

    const { pageSize, column, order } = this.state
    this.refetchPaginatedEntries(page, pageSize, column, order)
  }

  refetchPaginatedEntries = (page, pageSize, column, order) => {
    const { refetch } = this.props.devicesQuery;
    refetch({ page, pageSize, column, order })
  }

  handleChangePageSize = (pageSize) => {
    this.setState({ pageSize });
    localStorage.setItem(PAGE_SIZE_KEY, pageSize);
    const { page, column, order } = this.state;
    this.refetchPaginatedEntries(page, pageSize, column, order);
  }

  render() {
    const {
      showCreateDeviceModal,
      showDeleteDeviceModal,
      showDevicesAddLabelModal,
      showDevicesRemoveLabelModal,
      showDeviceRemoveAllLabelsModal,
      labelsSelected,
      deviceToRemoveLabel,
    } = this.state

    const { devices, loading, error } = this.props.devicesQuery;

    return(
      <>
        <MobileDisplay />
        <DesktopDisplay>
          <DeviceDashboardLayout {...this.props}>
            {
              error && <Text>Data failed to load, please reload the page and try again</Text>
            }
            {
              loading && <div style={{ padding: 40 }}><SkeletonLayout /></div>
            }
            {
              !loading &&  (
                <DeviceIndexTable
                  openDeleteDeviceModal={this.openDeleteDeviceModal}
                  openDevicesAddLabelModal={this.openDevicesAddLabelModal}
                  openDevicesRemoveLabelModal={this.openDevicesRemoveLabelModal}
                  openDeviceRemoveAllLabelsModal={this.openDeviceRemoveAllLabelsModal}
                  onChangePageSize={this.handleChangePageSize}
                  handleChangePage={this.handleChangePage}
                  devices={devices}
                  history={this.props.history}
                  handleChangePage={this.handleChangePage}
                  handleSortChange={this.handleSortChange}
                  pageSize={this.state.pageSize}
                  column={this.state.column}
                  order={this.state.order}
                  userEmail={this.props.user.email}
                />
              )
            }

            <DevicesAddLabelModal
              open={showDevicesAddLabelModal}
              onClose={this.closeDevicesAddLabelModal}
              devicesToUpdate={this.state.devicesSelected}
              totalDevices={devices && devices.totalEntries}
              allDevicesSelected={this.state.allDevicesSelected}
            />

            <DeviceRemoveLabelModal
              open={showDevicesRemoveLabelModal}
              onClose={this.closeDevicesRemoveLabelModal}
              labels={labelsSelected}
              device={deviceToRemoveLabel}
            />

            <DeviceRemoveAllLabelsModal
              open={showDeviceRemoveAllLabelsModal}
              onClose={this.closeDeviceRemoveAllLabelsModal}
              devices={this.state.devicesSelected}
              totalDevices={devices && devices.totalEntries}
              allDevicesSelected={this.state.allDevicesSelected}
            />

            <DeleteDeviceModal
              open={showDeleteDeviceModal}
              onClose={this.closeDeleteDeviceModal}
              allDevicesSelected={this.state.allDevicesSelected}
              devicesToDelete={this.state.devicesSelected}
              totalDevices={devices && devices.totalEntries}
            />
          </DeviceDashboardLayout>
        </DesktopDisplay>
      </>
    )
  }
}

function mapStateToProps(state) {
  return {
    currentOrganizationId: state.organization.currentOrganizationId,
    socket: state.apollo.socket,
  }
}

export default connect(mapStateToProps, null)(
  withGql(DeviceIndex, PAGINATED_DEVICES, props => ({ fetchPolicy: 'cache-first', variables: { page: 1, pageSize: startPageSize, column: DEFAULT_COLUMN, order: DEFAULT_ORDER }, name: 'devicesQuery' }))
)
