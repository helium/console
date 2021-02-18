import React, { Component } from 'react';
import { connect } from 'react-redux'
import DeviceIndexTable from './DeviceIndexTable';
import DashboardLayout from '../common/DashboardLayout';
import NewDeviceModal from './NewDeviceModal';
import ImportDevicesModal from './import/ImportDevicesModal';
import DevicesAddLabelModal from './DevicesAddLabelModal';
import DeleteDeviceModal from './DeleteDeviceModal';
import DeviceRemoveLabelModal from './DeviceRemoveLabelModal';
import DeviceRemoveAllLabelsModal from './DeviceRemoveAllLabelsModal';
import { PAGINATED_DEVICES, ALL_IMPORTS } from '../../graphql/devices';
import withGql from '../../graphql/withGql'
import get from 'lodash/get';
import UserCan from '../common/UserCan';
import { displayError, displayInfo } from '../../util/messages';
import analyticsLogger from '../../util/analyticsLogger';
import { Button, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { IndexSkeleton } from '../common/IndexSkeleton';
const { Text } = Typography

const DEFAULT_COLUMN = "name"
const DEFAULT_ORDER = "asc"
const PAGE_SIZE_KEY = 'devicePageSize';
let startPageSize = parseInt(localStorage.getItem(PAGE_SIZE_KEY)) || 1;

class DeviceIndex extends Component {
  state = {
    showCreateDeviceModal: false,
    showDeleteDeviceModal: false,
    showImportDevicesModal: false,
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
    importComplete: false
  }

  componentDidMount() {
    analyticsLogger.logEvent("ACTION_NAV_DEVICES_INDEX")
    const { socket, currentOrganizationId } = this.props

    this.channel = socket.channel("graphql:devices_index_table", {})
    this.channel.join()
    this.channel.on(`graphql:devices_index_table:${currentOrganizationId}:device_list_update`, (message) => {
      const { page, pageSize, column, order } = this.state
      this.refetchPaginatedEntries(page, pageSize, column, order)
    })
  }

  componentWillUnmount() {
    this.channel.leave()
  }

  openCreateDeviceModal = () => {
    this.setState({ showCreateDeviceModal: true })
  }

  closeCreateDeviceModal = () => {
    this.setState({ showCreateDeviceModal: false })
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

  openImportDevicesModal = () => {
    this.setState({ showImportDevicesModal: true });
  }

  closeImportDevicesModal = () => {
    this.setState({ showImportDevicesModal: false, importComplete: false });
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
      showImportDevicesModal,
      showDevicesAddLabelModal,
      showDevicesRemoveLabelModal,
      showDeviceRemoveAllLabelsModal,
      labelsSelected,
      deviceToRemoveLabel,
      importComplete
    } = this.state

    const { devices, loading, error } = this.props.devicesQuery;
    const { device_imports } = this.props.importsQuery;

    const hasDevices = devices && devices.entries.length > 0;

    const createDeviceButton = () => (
      <UserCan>
        <Button
          size="large"
          icon={<PlusOutlined />}
          onClick={this.openImportDevicesModal}
          disabled={!(device_imports && (!device_imports.entries.length || device_imports.entries[0].status !== "importing"))}
          style={{marginRight: hasDevices ? 0 : 10, borderRadius: 4 }}
        >
          Import Devices
        </Button>
        <Button
          size="large"
          type="primary"
          icon={<PlusOutlined />}
          onClick={this.openCreateDeviceModal}
          style={{ borderRadius: 4 }}
        >
          Add Device
        </Button>
      </UserCan>
    );

    const title = "Devices";
    return(
      <DashboardLayout
        title={title}
        user={this.props.user}
        extra={
          hasDevices && createDeviceButton()
        }
      >
        {hasDevices && <p className="page-description">
          Devices can be added to the Helium network. <a href="https://docs.helium.com/use-the-network/console/adding-devices" target="_blank"> Tell me more about adding devices.</a>
        </p>}
        {
          (error && <Text>Data failed to load, please reload the page and try again</Text>) || (
            loading ? <IndexSkeleton title={title} /> :
            <DeviceIndexTable
              openDeleteDeviceModal={this.openDeleteDeviceModal}
              openDevicesAddLabelModal={this.openDevicesAddLabelModal}
              openDevicesRemoveLabelModal={this.openDevicesRemoveLabelModal}
              openDeviceRemoveAllLabelsModal={this.openDeviceRemoveAllLabelsModal}
              onChangePageSize={this.handleChangePageSize}
              noDevicesButton={createDeviceButton}
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

        <NewDeviceModal open={showCreateDeviceModal} onClose={this.closeCreateDeviceModal}/>

        <ImportDevicesModal open={showImportDevicesModal} onClose={this.closeImportDevicesModal} importComplete={importComplete}/>

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
      </DashboardLayout>
    )
  }
}

function mapStateToProps(state) {
  return {
    currentOrganizationId: state.organization.currentOrganizationId,
    socket: state.apollo.socket,
  }
}

export default connect(mapStateToProps, null)(withGql(
  withGql(DeviceIndex, PAGINATED_DEVICES, props => ({ fetchPolicy: 'cache-and-network', variables: { page: 1, pageSize: startPageSize, column: DEFAULT_COLUMN, order: DEFAULT_ORDER }, name: 'devicesQuery' })),
  ALL_IMPORTS,
  props => ({ fetchPolicy: 'cache-and-network', variables: { page: 1, pageSize: startPageSize }, name: 'importsQuery' })
))
