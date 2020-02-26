import React, { Component } from 'react'
import DashboardLayout from '../common/DashboardLayout'
import CreateLabelModal from './CreateLabelModal'
import DeleteLabelModal from './DeleteLabelModal'
import LabelIndexTable from './LabelIndexTable'
import analyticsLogger from '../../util/analyticsLogger'
import { Button } from 'antd';

class LabelIndex extends Component {
  state = {
    showCreateLabelModal: false,
    showDeleteLabelModal: false,
    labelsToDelete: null,
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

  openDeleteLabelModal = (labelsToDelete) => {
    this.setState({ showDeleteLabelModal: true, labelsToDelete })
  }

  closeDeleteLabelModal = () => {
    this.setState({ showDeleteLabelModal: false })
  }

  render() {
    const { showCreateLabelModal, showDeleteLabelModal } = this.state
    return (
      <DashboardLayout title="Labels">
        <LabelIndexTable
          openCreateLabelModal={this.openCreateLabelModal}
          openDeleteLabelModal={this.openDeleteLabelModal}
        />

        <CreateLabelModal
          open={showCreateLabelModal}
          onClose={this.closeCreateLabelModal}
        />

        <DeleteLabelModal
          open={showDeleteLabelModal}
          onClose={this.closeDeleteLabelModal}
          labelsToDelete={this.state.labelsToDelete}
        />
      </DashboardLayout>
    )
  }
}

export default LabelIndex
