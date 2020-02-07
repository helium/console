import React, { Component } from 'react'
import DashboardLayout from '../common/DashboardLayout'
import OrganizationsTable from '../organizations/OrganizationsTable'
import NewOrganizationModal from '../organizations/NewOrganizationModal'
import CreateLabelModal from '../labels/CreateLabelModal'
import analyticsLogger from '../../util/analyticsLogger'
import { Card, Button } from 'antd';


class Dashboard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showOrganizationModal: false,
      showCreateLabelModal: false,
    }
    this.openOrganizationModal = this.openOrganizationModal.bind(this)
    this.closeOrganizationModal = this.closeOrganizationModal.bind(this)
    this.openCreateLabelModal = this.openCreateLabelModal.bind(this)
    this.closeCreateLabelModal = this.closeCreateLabelModal.bind(this)
  }

  componentDidMount() {
    analyticsLogger.logEvent("ACTION_NAV_DASHBOARD")
  }

  openOrganizationModal() {
    this.setState({ showOrganizationModal: true })
  }

  closeOrganizationModal() {
    this.setState({ showOrganizationModal: false })
  }

  openCreateLabelModal() {
    this.setState({ showCreateLabelModal: true })
  }

  closeCreateLabelModal() {
    this.setState({ showCreateLabelModal: false })
  }

  render() {
    const { showOrganizationModal, showCreateLabelModal } = this.state
    return (
      <DashboardLayout title="Dashboard">
        <Button
          type="primary"
          size="large"
          icon="tag"
          style={{ marginBottom: 20 }}
          onClick={this.openCreateLabelModal}
        >
          Create New Label
        </Button>

        <Card title="Organizations" bodyStyle={{padding:'0', paddingTop: 20}}>
          <OrganizationsTable openOrganizationModal={this.openOrganizationModal} />
        </Card>

        <NewOrganizationModal
          open={showOrganizationModal}
          onClose={this.closeOrganizationModal}
        />

        <CreateLabelModal
          open={showCreateLabelModal}
          onClose={this.closeCreateLabelModal}
        />
      </DashboardLayout>
    )
  }
}

export default Dashboard
