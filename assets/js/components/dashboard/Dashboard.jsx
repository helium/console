import React, { Component } from 'react'
import DashboardLayout from '../common/DashboardLayout'
import OrganizationsTable from '../teams/OrganizationsTable'
import OrganizationTeamsTable from '../teams/OrganizationTeamsTable'
import NewTeamModal from '../teams/NewTeamModal'
import NewOrganizationModal from '../teams/NewOrganizationModal'
import analyticsLogger from '../../util/analyticsLogger'
import { Card } from 'antd';


class Dashboard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showTeamModal: false,
      showOrganizationModal: false,
      organizationId: null,
      organizationName: "",
    }
    this.openTeamModal = this.openTeamModal.bind(this)
    this.closeTeamModal = this.closeTeamModal.bind(this)
    this.openOrganizationModal = this.openOrganizationModal.bind(this)
    this.closeOrganizationModal = this.closeOrganizationModal.bind(this)
  }

  componentDidMount() {
    analyticsLogger.logEvent("ACTION_NAV_DASHBOARD")
  }

  openTeamModal(organizationId, organizationName) {
    this.setState({ showTeamModal: true, organizationId, organizationName })
  }

  openOrganizationModal() {
    this.setState({ showOrganizationModal: true })
  }

  closeTeamModal() {
    this.setState({ showTeamModal: false, organizationId: null, organizationName: "" })
  }

  closeOrganizationModal() {
    this.setState({ showOrganizationModal: false })
  }

  render() {
    const { showTeamModal, showOrganizationModal, organizationName, organizationId } = this.state
    return (
      <DashboardLayout title="Dashboard">
      <Card title="Organizations">

        <OrganizationsTable openOrganizationModal={this.openOrganizationModal} />
        </Card>
        <Card title="Teams" >
        <OrganizationTeamsTable openTeamModal={this.openTeamModal} />
        </Card>
        <NewTeamModal
          open={showTeamModal}
          organizationName={organizationName}
          organizationId={organizationId}
          onClose={this.closeTeamModal}
        />

        <NewOrganizationModal
          open={showOrganizationModal}
          onClose={this.closeOrganizationModal}
        />
      </DashboardLayout>
    )
  }
}

export default Dashboard
