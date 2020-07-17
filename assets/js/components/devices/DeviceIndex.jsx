import React, { Component } from 'react';
import DeviceIndexTable from './DeviceIndexTable';
import DashboardLayout from '../common/DashboardLayout';
import NewDeviceModal from './NewDeviceModal';
import ImportDevicesModal from './ttn/ImportDevicesModal';
import DevicesAddLabelModal from './DevicesAddLabelModal';
import DeleteDeviceModal from './DeleteDeviceModal';
import DeviceRemoveLabelModal from './DeviceRemoveLabelModal';
import DeviceRemoveAllLabelsModal from './DeviceRemoveAllLabelsModal';
import {
  PAGINATED_DEVICES,
  DEVICE_SUBSCRIPTION,
  ALL_IMPORTS,
  IMPORT_ADDED_SUBSCRIPTION,
  IMPORT_UPDATED_SUBSCRIPTION
} from '../../graphql/devices';
import { graphql, compose } from 'react-apollo';
import get from 'lodash/get';
import UserCan from '../common/UserCan';
import { displayError, displayInfo } from '../../util/messages';
import analyticsLogger from '../../util/analyticsLogger';
import { Button } from 'antd';

const queryOptions = {
  options: props => ({
    variables: {
      page: 1,
      pageSize: 10
    },
    fetchPolicy: 'cache-and-network',
  })
}

@graphql(PAGINATED_DEVICES, {...queryOptions, name: 'devicesQuery'})
@graphql(ALL_IMPORTS, {...queryOptions, name: 'importsQuery'})
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
    pageSize: get(this.props.data, ['variables', 'pageSize']) || 10,
  }

  componentDidMount() {
    analyticsLogger.logEvent("ACTION_NAV_DEVICES_INDEX")
    let { subscribeToMore } = this.props.devicesQuery;

    subscribeToMore({
      document: DEVICE_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        this.handleSubscriptionAdded()
      }
    });

    subscribeToMore = this.props.importsQuery.subscribeToMore;

    subscribeToMore({
      document: IMPORT_ADDED_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        return {
          ...prev,
          device_imports: {
            entries: [subscriptionData.data.importAdded, ...prev.device_imports.entries],
            __typename: prev.device_imports.__typename
          }
        };
      }
    });

    subscribeToMore({
      document: IMPORT_UPDATED_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const updatedImport = subscriptionData.data.importUpdated;
        const replaceIndex = prev.device_imports.entries.findIndex(
          val => val.id === updatedImport.id
        )
        if (updatedImport.user_id === this.props.user.sub.replace("auth0|", "")) {
          if (updatedImport.status === "successful") {
            displayInfo(`Imported ${updatedImport.successful_devices} 
            device${(updatedImport.successful_devices !== 1 && "s") || ""} from The Things Network. 
            Refresh this page to see the changes.`);
          } else if (updatedImport.status === "failed"){
            displayError("Failed to import devices from The Things Network.");
          }
        }
        return {
          ...prev,
          device_imports: {
            entries: [
              ...prev.device_imports.entries.slice(0, replaceIndex),
              subscriptionData.data.importUpdated,
              ...prev.device_imports.entries.slice(replaceIndex + 1)
            ],
            __typename: prev.device_imports.__typename
          }
        };
      }
    })
  }

  openCreateDeviceModal = () => {
    this.setState({ showCreateDeviceModal: true })
  }

  closeCreateDeviceModal = () => {
    this.setState({ showCreateDeviceModal: false })
  }

  openDevicesAddLabelModal = (devicesSelected) => {
    this.setState({ showDevicesAddLabelModal: true, devicesSelected })
  }

  closeDevicesAddLabelModal = () => {
    this.setState({ showDevicesAddLabelModal: false })
  }

  openDeviceRemoveAllLabelsModal = (devicesSelected) => {
    this.setState({ showDeviceRemoveAllLabelsModal: true, devicesSelected })
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
  }

  openImportDevicesModal = () => {
    this.setState({ showImportDevicesModal: true });
  }

  closeImportDevicesModal = () => {
    this.setState({ showImportDevicesModal: false });
  }

  closeDeleteDeviceModal = () => {
    this.setState({ showDeleteDeviceModal: false })
  }

  handleChangePage = (page) => {
    this.setState({ page })

    const { pageSize } = this.state
    this.refetchPaginatedEntries(page, pageSize)
  }

  handleSubscriptionAdded = () => {
    const { page, pageSize } = this.state
    this.refetchPaginatedEntries(page, pageSize)
  }

  refetchPaginatedEntries = (page, pageSize) => {
    const { fetchMore } = this.props.devicesQuery;
    fetchMore({
      variables: { page, pageSize },
      updateQuery: (prev, { fetchMoreResult }) => fetchMoreResult
    })
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
      deviceToRemoveLabel
    } = this.state

    const { devices, loading, error } = this.props.devicesQuery;
    const { device_imports } = this.props.importsQuery;

    const hasDevices = devices && devices.entries.length > 0;

    const createDeviceButton = () => (
      <UserCan>
        <Button
          size="large"
          icon="plus"
          onClick={this.openImportDevicesModal}
          disabled={!(device_imports && (!device_imports.entries.length || device_imports.entries[0].status !== "importing"))}
          style={{marginRight: hasDevices ? 0 : 10}}
        >
          Import Devices
        </Button>
        <Button
          size="large"
          type="primary"
          icon="plus"
          onClick={this.openCreateDeviceModal}
        >
          Add New Device
        </Button>
      </UserCan>
    )
    return(
      <DashboardLayout
        title="Devices"
        extra={
          hasDevices && createDeviceButton()
        }
      >
        {
          (error && <Text>Data failed to load, please reload the page and try again</Text>) || (
            loading ? null :
            <DeviceIndexTable
              openDeleteDeviceModal={this.openDeleteDeviceModal}
              openDevicesAddLabelModal={this.openDevicesAddLabelModal}
              openDevicesRemoveLabelModal={this.openDevicesRemoveLabelModal}
              openDeviceRemoveAllLabelsModal={this.openDeviceRemoveAllLabelsModal}
              noDevicesButton={createDeviceButton}
              handleChangePage={this.handleChangePage}
              devices={devices}
              history={this.props.history}
              handleChangePage={this.handleChangePage}
            />
          )
        }

        <NewDeviceModal open={showCreateDeviceModal} onClose={this.closeCreateDeviceModal}/>

        <ImportDevicesModal open={showImportDevicesModal} onClose={this.closeImportDevicesModal}/>

        <DevicesAddLabelModal
          open={showDevicesAddLabelModal}
          onClose={this.closeDevicesAddLabelModal}
          devicesToUpdate={this.state.devicesSelected}
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
        />

        <DeleteDeviceModal
          open={showDeleteDeviceModal}
          onClose={this.closeDeleteDeviceModal}
          devicesToDelete={this.state.devicesSelected}
        />
      </DashboardLayout>
    )
  }
}

export default DeviceIndex
