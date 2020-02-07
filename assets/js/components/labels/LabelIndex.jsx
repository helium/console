import React, { Component } from 'react'
import DashboardLayout from '../common/DashboardLayout'
import CreateLabelModal from '../labels/CreateLabelModal'
import analyticsLogger from '../../util/analyticsLogger'
import { Card, Button } from 'antd';


class LabelIndex extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showCreateLabelModal: false,
    }
    this.openCreateLabelModal = this.openCreateLabelModal.bind(this)
    this.closeCreateLabelModal = this.closeCreateLabelModal.bind(this)
  }

  componentDidMount() {
    // analyticsLogger.logEvent("ACTION_NAV_LABELS")
  }

  openCreateLabelModal() {
    this.setState({ showCreateLabelModal: true })
  }

  closeCreateLabelModal() {
    this.setState({ showCreateLabelModal: false })
  }

  render() {
    const { showCreateLabelModal } = this.state
    return (
      <DashboardLayout title="Labels">
        <Button
          type="primary"
          size="large"
          icon="tag"
          style={{ marginBottom: 20 }}
          onClick={this.openCreateLabelModal}
        >
          Create New Label
        </Button>

        <CreateLabelModal
          open={showCreateLabelModal}
          onClose={this.closeCreateLabelModal}
        />
      </DashboardLayout>
    )
  }
}

export default LabelIndex
