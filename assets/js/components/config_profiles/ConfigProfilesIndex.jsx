import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import DashboardLayout from "../common/DashboardLayout";
import TableHeader from "../common/TableHeader";
import AllIcon from "../../../img/config_profile/profile_blue.svg";
import PlusIcon from "../../../img/config_profile/plus.svg";
import ConfigProfileBar from "./ConfigProfileBar";
import ConfigProfileForm from "./ConfigProfileForm";
import { ALL_CONFIG_PROFILES } from "../../graphql/configProfiles";
import { useQuery } from "@apollo/client";
import { SkeletonLayout } from "../common/SkeletonLayout";
import analyticsLogger from "../../util/analyticsLogger";
import { minWidth } from "../../util/constants";
import ConfigProfileIndexTable from "./ConfigProfileIndexTable";
import DeleteConfigProfileModal from "./DeleteConfigProfileModal";

export default (props) => {
  const history = useHistory();

  const [showPage, setShowPage] = useState("allConfigProfiles");
  const [showDeleteConfigProfileModal, setShowDeleteConfigProfileModal] =
    useState(false);
  const [selectedConfigProfile, setSelectedConfigProfile] = useState(null);

  const { loading, error, data, refetch } = useQuery(ALL_CONFIG_PROFILES, {
    fetchPolicy: "cache-first",
  });
  const configProfileData = data ? data.allConfigProfiles : [];

  const openDeleteConfigProfileModal = (config_profile) => {
    setShowDeleteConfigProfileModal(true);
    setSelectedConfigProfile(config_profile);
  };

  const closeDeleteConfigProfileModal = () => {
    setShowDeleteConfigProfileModal(false);
    setSelectedConfigProfile(null);
  };

  const socket = useSelector((state) => state.apollo.socket);
  const currentOrganizationId = useSelector(
    (state) => state.organization.currentOrganizationId
  );
  const configProfilesChannel = socket.channel(
    "graphql:config_profiles_index_table",
    {}
  );
  useEffect(() => {
    // executed when mounted
    configProfilesChannel.join();
    configProfilesChannel.on(
      `graphql:config_profiles_index_table:${currentOrganizationId}:config_profile_list_update`,
      (_message) => {
        refetch();
      }
    );
    analyticsLogger.logEvent("ACTION_NAV_CONFIG_PROFILE_INDEX");

    // executed when unmounted
    return () => {
      configProfilesChannel.leave();
    };
  }, []);

  useEffect(() => {
    if (props.match.params.id) {
      setShowPage("showConfigProfile");
    } else if (props.match.path === "/config_profiles/new") {
      setShowPage("new");
    }
  });

  useEffect(() => {
    if (!props.match.params.id) {
      refetch();
    }
  }, [props.match.params.id]);

  return (
    <DashboardLayout title="My Profiles" user={props.user}>
      <TableHeader
        backgroundColor="#D3E0EE"
        otherColor="#ACC6DD"
        homeIcon={null}
        goToAll={() => {
          setShowPage("allConfigProfiles");
          history.push("/config_profiles");
        }}
        allIcon={AllIcon}
        textColor="#3C6B95"
        allText="All Profiles"
        onHomePage={showPage === "home"}
        onAllPage={showPage === "allConfigProfiles"}
        onNewPage={showPage === "new"}
        addIcon={PlusIcon}
        goToNew={() => {
          setShowPage("new");
          history.push("/config_profiles/new");
        }}
        noHome
        borderRadius="25px"
        extraContent={
          <ConfigProfileBar
            shownConfigProfileId={props.match.params.id}
            configProfiles={configProfileData}
          />
        }
        newText="Add New Profile"
      >
        {showPage === "allConfigProfiles" && error && (
          <div style={{ padding: 40 }}>
            <Text>
              Data failed to load, please reload the page and try again
            </Text>
          </div>
        )}
        {showPage === "allConfigProfiles" && loading && (
          <div style={{ padding: 40 }}>
            <SkeletonLayout />
          </div>
        )}
        {showPage === "allConfigProfiles" && !loading && (
          <ConfigProfileIndexTable
            data={configProfileData}
            history={history}
            openDeleteConfigProfileModal={openDeleteConfigProfileModal}
          />
        )}
        {showPage === "new" && (
          <div className="no-scroll-bar" style={{ overflowX: "scroll" }}>
            <div style={{ minWidth }}>
              <ConfigProfileForm />
            </div>
          </div>
        )}
        {props.match.params.id && showPage === "showConfigProfile" && (
          <div className="no-scroll-bar" style={{ overflowX: "scroll" }}>
            <div style={{ minWidth }}>
              <ConfigProfileForm
                id={props.match.params.id}
                show
                openDeleteConfigProfileModal={openDeleteConfigProfileModal}
              />
            </div>
          </div>
        )}
      </TableHeader>

      <DeleteConfigProfileModal
        open={showDeleteConfigProfileModal}
        selected={selectedConfigProfile}
        close={closeDeleteConfigProfileModal}
      />
    </DashboardLayout>
  );
};
