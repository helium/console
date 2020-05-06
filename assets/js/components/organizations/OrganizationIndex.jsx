import React, { Component } from 'react'
import DashboardLayout from '../common/DashboardLayout'
import OrganizationsTable from '../organizations/OrganizationsTable'
import NewOrganizationModal from '../organizations/NewOrganizationModal'
import UserCan from '../common/UserCan'
import analyticsLogger from '../../util/analyticsLogger'
import { Card, Button } from 'antd';

class OrganizationIndex extends Component {
  state = {
    showOrganizationModal: false,
  }

  componentDidMount() {
    analyticsLogger.logEvent("ACTION_NAV_DASHBOARD")
  }

  openOrganizationModal = () => {
    this.setState({ showOrganizationModal: true })
  }

  closeOrganizationModal = () => {
    this.setState({ showOrganizationModal: false })
  }

  render() {
    const { showOrganizationModal } = this.state
    return (
      <DashboardLayout
        title="Organizations"
        extra={
          <UserCan>
            <Button
              icon="plus"
              size="large"
              onClick={() => {
                analyticsLogger.logEvent("ACTION_NEW_ORG")
                this.openOrganizationModal()
              }}
              type="primary"
            >
              Add Organization
            </Button>
          </UserCan>
        }
      >
        <Card title="Organizations" bodyStyle={{padding:'0', paddingTop: 1, overflowX: 'scroll' }}>
          <OrganizationsTable />
        </Card>

        <NewOrganizationModal
          open={showOrganizationModal}
          onClose={this.closeOrganizationModal}
        />
      </DashboardLayout>
    )
  }
}

export default OrganizationIndex
