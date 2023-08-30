import React, { useState, useEffect } from "react";
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
import { useQuery } from "@apollo/client";
import { GET_VETTED_USER_STATUS } from "../../graphql/users";

export default ({ user }) => {
  const { data } = useQuery(GET_VETTED_USER_STATUS, {
    variables: { email: user.email },
    skip: !(
      window.user_invite_only === "true" ||
      process.env.USER_INVITE_ONLY === "true"
    ),
  });

  const [showOrganizationModal, setShowOrganizationModal] = useState(false);
  const [showDeleteOrganizationModal, setShowDeleteOrganizationModal] =
    useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [showEditOrganizationModal, setShowEditOrganizationModal] =
    useState(false);

  useEffect(() => {
    analyticsLogger.logEvent(
      isMobile ? "ACTION_NAV_DASHBOARD_MOBILE" : "ACTION_NAV_DASHBOARD"
    );
  }, []);

  const openOrganizationModal = () => {
    setShowOrganizationModal(true);
  };

  const closeOrganizationModal = () => {
    setShowOrganizationModal(false);
  };

  const openDeleteOrganizationModal = (selectedOrg) => {
    setShowDeleteOrganizationModal(true);
    setSelectedOrg(selectedOrg);
  };

  const closeDeleteOrganizationModal = () => {
    setShowDeleteOrganizationModal(false);
    setSelectedOrg(null);
  };

  const openEditOrganizationModal = (selectedOrg) => {
    setShowEditOrganizationModal(true);
    setSelectedOrg(selectedOrg);
  };

  const closeEditOrganizationModal = () => {
    setShowEditOrganizationModal(false);
    setSelectedOrg(null);
  };

  return (
    <>
      <MobileDisplay>
        <MobileLayout>
          <MobileOrganizationIndex user={user} />
        </MobileLayout>
      </MobileDisplay>

      <DesktopDisplay>
        <DashboardLayout title="Organizations" user={user} noAddButton>
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
                {process.env.IMPOSE_HARD_CAP !== "true" &&
                  (window.user_invite_only === "true" ||
                  process.env.USER_INVITE_ONLY === "true"
                    ? data?.vettedUserStatus.vetted === true
                    : true) && (
                    <UserCan noManager>
                      <Button
                        icon={<PlusOutlined />}
                        style={{ borderRadius: 4 }}
                        onClick={() => {
                          analyticsLogger.logEvent("ACTION_NEW_ORG");
                          openOrganizationModal();
                        }}
                        type="primary"
                      >
                        Add Organization
                      </Button>
                    </UserCan>
                  )}
              </div>
              <OrganizationsTable
                openDeleteOrganizationModal={openDeleteOrganizationModal}
                openEditOrganizationModal={openEditOrganizationModal}
                user={user}
              />
            </div>
          </div>

          <NewOrganizationModal
            open={showOrganizationModal}
            onClose={closeOrganizationModal}
          />

          <DeleteOrganizationModal
            open={showDeleteOrganizationModal}
            onClose={closeDeleteOrganizationModal}
            selectedOrgId={selectedOrg && selectedOrg.id}
          />
          <EditOrganizationModal
            open={showEditOrganizationModal}
            onClose={closeEditOrganizationModal}
            selectedOrg={selectedOrg}
          />
        </DashboardLayout>
      </DesktopDisplay>
    </>
  );
};
