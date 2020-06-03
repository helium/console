import React, { Component } from 'react'
import DeviceIndexTable from './DeviceIndexTable'
import DashboardLayout from '../common/DashboardLayout'
import NewDeviceModal from './NewDeviceModal'
import DevicesAddLabelModal from './DevicesAddLabelModal'
import DeleteDeviceModal from './DeleteDeviceModal'
import DeviceRemoveLabelModal from './DeviceRemoveLabelModal'
import DeviceRemoveAllLabelsModal from './DeviceRemoveAllLabelsModal'
import { PAGINATED_DEVICES, DEVICE_SUBSCRIPTION } from '../../graphql/devices'
import { graphql } from 'react-apollo';
import get from 'lodash/get'
import UserCan from '../common/UserCan'
import analyticsLogger from '../../util/analyticsLogger'
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

@graphql(PAGINATED_DEVICES, queryOptions)
class DeviceIndex extends Component {
  state = {
    showCreateDeviceModal: false,
    showDeleteDeviceModal: false,
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
    const { subscribeToMore } = this.props.data

    subscribeToMore({
      document: DEVICE_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        this.handleSubscriptionAdded()
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
    const { fetchMore } = this.props.data
    fetchMore({
      variables: { page, pageSize },
      updateQuery: (prev, { fetchMoreResult }) => fetchMoreResult
    })
  }

  render() {
    const {
      showCreateDeviceModal,
      showDeleteDeviceModal,
      showDevicesAddLabelModal,
      showDevicesRemoveLabelModal,
      showDeviceRemoveAllLabelsModal,
      labelsSelected,
      deviceToRemoveLabel
    } = this.state

    const { devices, loading, error } = this.props.data

    const createDeviceButton = () => (
      <UserCan>
        <Button
          size="large"
          type="primary"
          icon="plus"
          onClick={this.openCreateDeviceModal}
        >
          Add Device
        </Button>
      </UserCan>
    )
    return(
      <DashboardLayout
        title="Devices"
        extra={
          devices && devices.entries.length > 0 &&
          createDeviceButton()
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
              devices={devices}
              history={this.props.history}
            />
          )
        }

        <NewDeviceModal open={showCreateDeviceModal} onClose={this.closeCreateDeviceModal}/>

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
