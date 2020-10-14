import React, { Component } from 'react'
import DashboardLayout from '../common/DashboardLayout'
import OrganizationsTable from '../organizations/OrganizationsTable'
import NewOrganizationModal from '../organizations/NewOrganizationModal'
import DeleteOrganizationModal from '../organizations/DeleteOrganizationModal'
import UserCan from '../common/UserCan'
import analyticsLogger from '../../util/analyticsLogger'
import { Card, Button } from 'antd';

class OrganizationIndex extends Component {
  state = {
    showOrganizationModal: false,
    showDeleteOrganizationModal: false,
    selectedOrgForDelete: null
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

  openDeleteOrganizationModal = selectedOrgForDelete => {
    this.setState({ showDeleteOrganizationModal: true, selectedOrgForDelete })
  }

  closeDeleteOrganizationModal = () => {
    this.setState({ showDeleteOrganizationModal: false, selectedOrgForDelete: null })
  }

  render() {
    const { showOrganizationModal, showDeleteOrganizationModal, selectedOrgForDelete } = this.state
    return (
      <DashboardLayout
        title="Organizations"
        user={this.props.user}
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
          <OrganizationsTable
            openDeleteOrganizationModal={this.openDeleteOrganizationModal}
          />
        </Card>

        <NewOrganizationModal
          open={showOrganizationModal}
          onClose={this.closeOrganizationModal}
        />

        <DeleteOrganizationModal
          open={showDeleteOrganizationModal}
          onClose={this.closeDeleteOrganizationModal}
          selectedOrgId={selectedOrgForDelete}
        />
      </DashboardLayout>
    )
  }
}

export default OrganizationIndex
