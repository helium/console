import React, { Component } from 'react'
import DashboardLayout from '../common/DashboardLayout'
import SwapLabelModal from './SwapLabelModal'
import CreateLabelModal from './CreateLabelModal'
import DeleteLabelModal from './DeleteLabelModal'
import RemoveAllDevicesFromLabelsModal from './RemoveAllDevicesFromLabelsModal'
import LabelIndexTable from './LabelIndexTable'
import analyticsLogger from '../../util/analyticsLogger'
import UserCan from '../common/UserCan'
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

class LabelIndex extends Component {
  state = {
    showCreateLabelModal: false,
    showSwapLabelModal: false,
    showDeleteLabelModal: false,
    showRemoveAllDevicesFromLabelsModal: false,
    labelsSelected: null,
  }

  componentDidMount() {
    analyticsLogger.logEvent("ACTION_NAV_LABELS_INDEX")
  }

  openCreateLabelModal = () => {
    this.setState({ showCreateLabelModal: true })
  }

  closeCreateLabelModal = () => {
    this.setState({ showCreateLabelModal: false })
  }

  openSwapLabelModal = (labelsSelected) => {
    this.setState({ showSwapLabelModal: true, labelsSelected })
  }

  closeSwapLabelModal = () => {
    this.setState({ showSwapLabelModal: false })
  }

  openDeleteLabelModal = (labelsSelected) => {
    this.setState({ showDeleteLabelModal: true, labelsSelected })
  }

  closeDeleteLabelModal = () => {
    this.setState({ showDeleteLabelModal: false })
  }

  openRemoveAllDevicesFromLabelsModal = (labelsSelected) => {
    this.setState({ showRemoveAllDevicesFromLabelsModal: true, labelsSelected })
  }

  closeRemoveAllDevicesFromLabelsModal = () => {
    this.setState({ showRemoveAllDevicesFromLabelsModal: false })
  }

  render() {
    const {
      showRemoveAllDevicesFromLabelsModal,
      showSwapLabelModal,
      showCreateLabelModal,
      showDeleteLabelModal,
      labelsSelected
    } = this.state
    return (
      <DashboardLayout
        title="Labels"
        user={this.props.user}
        extra={
          <UserCan>
            <Button
              size="large"
              type="primary"
              icon={<PlusOutlined />}
              style={{ borderRadius: 4 }}
              onClick={this.openCreateLabelModal}
            >
              Add Label
            </Button>
          </UserCan>
        }
      >
        <LabelIndexTable
          openSwapLabelModal={this.openSwapLabelModal}
          openDeleteLabelModal={this.openDeleteLabelModal}
          openRemoveAllDevicesFromLabelsModal={this.openRemoveAllDevicesFromLabelsModal}
          openLabelAddChannelModal={this.openLabelAddChannelModal}
          history={this.props.history}
        />

        <SwapLabelModal
          open={showSwapLabelModal}
          onClose={this.closeSwapLabelModal}
          labelToSwap={labelsSelected}
        />

        <CreateLabelModal
          open={showCreateLabelModal}
          onClose={this.closeCreateLabelModal}
        />

        <DeleteLabelModal
          open={showDeleteLabelModal}
          onClose={this.closeDeleteLabelModal}
          labelsToDelete={labelsSelected}
        />

        <RemoveAllDevicesFromLabelsModal
          open={showRemoveAllDevicesFromLabelsModal}
          onClose={this.closeRemoveAllDevicesFromLabelsModal}
          labels={labelsSelected}
        />
      </DashboardLayout>
    )
  }
}

export default LabelIndex
