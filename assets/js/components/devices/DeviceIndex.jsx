import React, { Component } from 'react';
import { connect } from 'react-redux'
import DeviceIndexTable from './DeviceIndexTable';
import DeviceNew from './DeviceNew';
import LabelNew from '../labels/LabelNew';
import DeviceIndexLabelsBar from './DeviceIndexLabelsBar';
import DeviceIndexLabelShow from './DeviceIndexLabelShow';
import DashboardLayout from '../common/DashboardLayout';
import AddResourceButton from '../common/AddResourceButton';
import NavPointTriangle from '../common/NavPointTriangle';
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
import { SkeletonLayout } from '../common/SkeletonLayout';
import HomeIcon from '../../../img/devices/device-index-home-icon.svg'
import AllIcon from '../../../img/devices/device-index-all-icon.svg'
import PlusIcon from '../../../img/devices/device-index-plus-icon.svg'
import PlusDeviceIcon from '../../../img/devices/device-index-plus-device-icon.svg'
const { Text } = Typography
import _JSXStyle from "styled-jsx/style"
import TableHeader from '../common/TableHeader';

const DEFAULT_COLUMN = "name"
const DEFAULT_ORDER = "asc"
const PAGE_SIZE_KEY = 'devicePageSize';
let startPageSize = parseInt(localStorage.getItem(PAGE_SIZE_KEY)) || 10;

class DeviceIndex extends Component {
  state = {
    showPage: 'allDevices',
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

    this.importChannel = socket.channel("graphql:device_import_update", {})
    this.importChannel.join()
    this.importChannel.on(`graphql:device_import_update:${currentOrganizationId}:import_list_updated`, (message) => {
      const { page, pageSize } = this.state
      this.props.importsQuery.refetch({ page, pageSize })
      const user_id = user.sub.slice(6)

      if (user_id === message.user_id && message.status === 'success') {
        this.setState({ importComplete: true })

        displayInfo(
          `Imported ${message.successful_devices} device${(message.successful_devices !== 1 && "s") || ""} from ${
          message.type === "ttn" ? "The Things Network" : "CSV"}. Refresh this page to see the changes.`
        )
      }
      if (user_id === message.user_id && message.status === 'failed') {
        displayError(`Failed to import devices from ${message.type === "ttn" ? "The Things Network" : "CSV"}.`)
      }
    })

    if (this.props.history.location.search === '?show_new=true') {
      this.setState({ showPage: "new" })
    }

    if (this.props.history.location.search === '?show_new_label=true') {
      this.setState({ showPage: "newLabel" })
    }
  }

  componentWillUnmount() {
    this.channel.leave()
    this.importChannel.leave()
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

  handleChangeView = label => {
    this.setState({ showPage: label })
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
      importComplete,
      showPage
    } = this.state

    const { devices, loading, error } = this.props.devicesQuery;
    const { device_imports } = this.props.importsQuery;

    const title = "My Devices";
    return(
      <DashboardLayout
        title={title}
        user={this.props.user}
        noAddButton
      >
        <TableHeader
          backgroundColor='#D3E0EE'
          goHome={() => { this.setState({ showPage: 'home'})}}
          otherColor='#ACC6DD'
          homeIcon={HomeIcon}
          goToAll={() => { this.setState({ showPage: 'allDevices'})}}
          allIcon={AllIcon}
          textColor='#3C6B95'
          allText='All Devices'
          allSubtext={devices && devices.totalEntries + ' Devices'}
          onHomePage={showPage === 'home'}
          onAllPage={showPage === 'allDevices'}
          onNewPage={showPage === 'new'}
          addIcon={PlusDeviceIcon}
          goToNew={() => { this.setState({ showPage: 'new'})}}
          extraContent={
            <React.Fragment>
              <div style={{
                backgroundColor: '#ACC6DD',
                borderRadius: 6,
                padding: 10,
                cursor: 'pointer',
                height: 50,
                width: 50,
                minWidth: 50,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
                whiteSpace: 'nowrap',
                position: 'relative'
              }} onClick={() => this.setState({ showPage: 'newLabel' })}>
                <img src={PlusIcon} style={{ height: 20 }} />
                {showPage === 'newLabel' && <NavPointTriangle />}
              </div>
              <DeviceIndexLabelsBar selectLabel={this.handleChangeView} currentPage={showPage}/>
            </React.Fragment>
          }
        >
          {
            showPage === "home" && (
              <div className="blankstateWrapper">
              <div className="message">
                <h1>Devices</h1>
                <div className="explainer">
                  <p>Devices can be added to the Helium network.</p>
                  <p>More details about adding devices can be found <a href="https://docs.helium.com/use-the-network/console/adding-devices" target="_blank"> here.</a></p>
                </div>
              </div>
              <style jsx>{`
                  .message {
                    width: 100%;
                    max-width: 500px;
                    margin: 0 auto;
                    text-align: center;
                  }
                  .explainer {
                    padding: 20px 60px 1px 60px;
                    border-radius: 20px;
                    text-align: center;
                    margin-top: 20px;
                    box-sizing: border-box;
                    border: none;
                  }
                  .explainer p {
                    color: #565656;
                    font-size: 15px;
                  }
                  .explainer p a {
                    color: #096DD9;
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
                    margin-bottom: 10px;
                  }
                `}</style>
              </div>
            )
          }
          {
            showPage === 'allDevices' && error && <Text>Data failed to load, please reload the page and try again</Text>
          }
          {
            showPage === 'allDevices' && loading && <div style={{ padding: 40 }}><SkeletonLayout /></div>
          }
          {
            showPage === 'allDevices' && !loading &&  (
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
                deviceImports={device_imports}
                openImportDevicesModal={this.openImportDevicesModal}
              />
            )
          }
          {
            showPage === 'new' && <DeviceNew handleChangeView={this.handleChangeView}/>
          }
          {
            showPage === 'newLabel' && <LabelNew handleChangeView={this.handleChangeView}/>
          }
          {
            showPage.indexOf("Label+") !== -1 && (
              <DeviceIndexLabelShow id={showPage.split("+")[1]}/>
            )
          }
        </TableHeader>

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

        <AddResourceButton deviceCallback={() => this.setState({ showPage: 'new' })} labelCallback={() => this.setState({ showPage: 'newLabel' })}/>
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
  withGql(DeviceIndex, PAGINATED_DEVICES, props => ({ fetchPolicy: 'cache-first', variables: { page: 1, pageSize: startPageSize, column: DEFAULT_COLUMN, order: DEFAULT_ORDER }, name: 'devicesQuery' })),
  ALL_IMPORTS,
  props => ({ fetchPolicy: 'cache-first', variables: { page: 1, pageSize: startPageSize }, name: 'importsQuery' })
))
