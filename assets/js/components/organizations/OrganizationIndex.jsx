import React, { Component } from 'react'
import DashboardLayout from '../common/DashboardLayout'
import OrganizationsTable from '../organizations/OrganizationsTable'
import NewOrganizationModal from '../organizations/NewOrganizationModal'
import DeleteOrganizationModal from '../organizations/DeleteOrganizationModal'
import UserCan from '../common/UserCan'
import analyticsLogger from '../../util/analyticsLogger'
import { minWidth } from '../../util/constants'
import { Button, Typography } from 'antd';
import PlusOutlined from '@ant-design/icons/PlusOutlined'
const { Text } = Typography

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
        noAddButton
      >
        <div style={{ height: '100%', width: '100%', backgroundColor: '#ffffff', borderRadius: 6, overflow: 'hidden', boxShadow: '0px 20px 20px -7px rgba(17, 24, 31, 0.19)' }}>
          <div style={{ overflowX: 'scroll'}} className="no-scroll-bar">
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: '30px 20px 20px 30px', minWidth }}>
              <Text style={{ fontSize: 22, fontWeight: 600 }}>All Organizations</Text>
              <UserCan noManager>
                <Button
                  icon={<PlusOutlined />}
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
            </div>
            <OrganizationsTable
              openDeleteOrganizationModal={this.openDeleteOrganizationModal}
              user={this.props.user}
            />
          </div>
        </div>

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
