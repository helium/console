import React, { Component } from "react";
import DashboardLayout from "../common/DashboardLayout";
import { MobileDisplay, DesktopDisplay } from "../mobile/MediaQuery";
import MobileLayout from "../mobile/MobileLayout";
import MobileOrganizationIndex from "../mobile/organizations/MobileOrganizationIndex";
import OrganizationsTable from "../organizations/OrganizationsTable";
import NewOrganizationModal from "../organizations/NewOrganizationModal";
import DeleteOrganizationModal from "../organizations/DeleteOrganizationModal";
import EditOrganizationModal from "../organizations/EditOrganizationModal";
import UserCan from "../common/UserCan";
import analyticsLogger from "../../util/analyticsLogger";
import { minWidth } from "../../util/constants";
import { Button, Typography } from "antd";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
const { Text } = Typography;
import { isMobile } from "../../util/constants";

class OrganizationIndex extends Component {
  state = {
    showOrganizationModal: false,
    showDeleteOrganizationModal: false,
    selectedOrg: null,
    showEditOrganizationModal: false,
  };

  componentDidMount() {
    analyticsLogger.logEvent(
      isMobile ? "ACTION_NAV_DASHBOARD_MOBILE" : "ACTION_NAV_DASHBOARD"
    );
  }

  openOrganizationModal = () => {
    this.setState({ showOrganizationModal: true });
  };

  closeOrganizationModal = () => {
    this.setState({ showOrganizationModal: false });
  };

  openDeleteOrganizationModal = (selectedOrg) => {
    this.setState({ showDeleteOrganizationModal: true, selectedOrg });
  };

  closeDeleteOrganizationModal = () => {
    this.setState({
      showDeleteOrganizationModal: false,
      selectedOrg: null,
    });
  };

  openEditOrganizationModal = (selectedOrg) => {
    this.setState({ showEditOrganizationModal: true, selectedOrg });
  };

  closeEditOrganizationModal = () => {
    this.setState({
      showEditOrganizationModal: false,
      selectedOrg: null,
    });
  };

  render() {
    const {
      showOrganizationModal,
      showDeleteOrganizationModal,
      selectedOrg,
      showEditOrganizationModal,
    } = this.state;
    return (
      <>
        <MobileDisplay>
          <MobileLayout>
            <MobileOrganizationIndex user={this.props.user} />
          </MobileLayout>
        </MobileDisplay>

        <DesktopDisplay>
          <DashboardLayout
            title="Organizations"
            user={this.props.user}
            noAddButton
          >
            <div
              style={{
                height: "100%",
                width: "100%",
                backgroundColor: "#ffffff",
                borderRadius: 6,
                overflow: "hidden",
                boxShadow: "0px 20px 20px -7px rgba(17, 24, 31, 0.19)",
              }}
            >
              <div style={{ overflowX: "scroll" }} className="no-scroll-bar">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    padding: "30px 20px 20px 30px",
                    minWidth,
                  }}
                >
                  <Text style={{ fontSize: 22, fontWeight: 600 }}>
                    All Organizations
                  </Text>
                  <UserCan noManager>
                    <Button
                      icon={<PlusOutlined />}
                      style={{ borderRadius: 4 }}
                      onClick={() => {
                        analyticsLogger.logEvent("ACTION_NEW_ORG");
                        this.openOrganizationModal();
                      }}
                      type="primary"
                    >
                      Add Organization
                    </Button>
                  </UserCan>
                </div>
                <OrganizationsTable
                  openDeleteOrganizationModal={this.openDeleteOrganizationModal}
                  openEditOrganizationModal={this.openEditOrganizationModal}
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
              selectedOrgId={selectedOrg && selectedOrg.id}
            />
            <EditOrganizationModal
              open={showEditOrganizationModal}
              onClose={this.closeEditOrganizationModal}
              selectedOrg={selectedOrg}
            />
          </DashboardLayout>
        </DesktopDisplay>
      </>
    );
  }
}

export default OrganizationIndex;
