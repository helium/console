import React, { Component } from 'react'
import DashboardLayout from '../common/DashboardLayout'
import OrganizationsTable from '../organizations/OrganizationsTable'
import NewOrganizationModal from '../organizations/NewOrganizationModal'
import analyticsLogger from '../../util/analyticsLogger'
import { Card } from 'antd';


class Dashboard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showOrganizationModal: false,
    }
    this.openOrganizationModal = this.openOrganizationModal.bind(this)
    this.closeOrganizationModal = this.closeOrganizationModal.bind(this)
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

  render() {
    const { showOrganizationModal } = this.state
    return (
      <DashboardLayout title="Dashboard">
        <Card title="Organizations" bodyStyle={{padding:'0', paddingTop: 20}}>
          <OrganizationsTable openOrganizationModal={this.openOrganizationModal} />
        </Card>

        <NewOrganizationModal
          open={showOrganizationModal}
          onClose={this.closeOrganizationModal}
        />
      </DashboardLayout>
    )
  }
}

export default Dashboard
