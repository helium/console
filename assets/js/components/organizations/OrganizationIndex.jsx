import React, { Component } from 'react'
import DashboardLayout from '../common/DashboardLayout'
import OrganizationsTable from '../organizations/OrganizationsTable'
import NewOrganizationModal from '../organizations/NewOrganizationModal'
import DeleteOrganizationModal from '../organizations/DeleteOrganizationModal'
import UserCan from '../common/UserCan'
import analyticsLogger from '../../util/analyticsLogger'
import { Card, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons'

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
          <UserCan noManager>
            <Button
              icon={<PlusOutlined />}
              size="large"
              style={{ borderRadius: 4 }}
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
        <p className="page-description">
          Organizations help keep related projects together. <a href="https://docs.helium.com/use-the-network/console/users/#organizations" target="_blank"> Tell me more about organizations.</a>
        </p>
        <Card title="Organizations" bodyStyle={{padding:'0', paddingTop: 1, overflowX: 'scroll' }}>
          <OrganizationsTable
            openDeleteOrganizationModal={this.openDeleteOrganizationModal}
            user={this.props.user}
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
