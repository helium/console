import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import DashboardLayout from "../common/DashboardLayout";
import TableHeader from "../common/TableHeader";
import AllIcon from "../../../img/alerts/alert-index-all-icon.svg";
import PlusIcon from "../../../img/alerts/alert-index-plus-icon.svg";
import ConfigProfileBar from "./ConfigProfileBar";
import ConfigProfileForm from "./ConfigProfileForm";
import { minWidth } from "../../util/constants";

export default (props) => {
  const history = useHistory();
  const [showPage, setShowPage] = useState("allProfiles");

  useEffect(() => {
    if (props.match.params.id) {
      setShowPage("showConfigProfile");
    } else if (props.match.path === "/config_profiles/new") {
      setShowPage("new");
    }
  });

  return (
    <DashboardLayout title="My Profiles" user={props.user}>
      <TableHeader
        backgroundColor="#D3E0EE"
        otherColor="#ACC6DD"
        homeIcon={null}
        goToAll={() => {
          setShowPage("allProfiles");
          history.push("/config_profiles");
        }}
        allIcon={AllIcon}
        textColor="#3C6B95"
        allText="All Profiles"
        onHomePage={showPage === "home"}
        onAllPage={showPage === "allProfiles"}
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
            configProfiles={[]}
          />
        }
        newText="Add New Profile"
      >
        {showPage === "new" && (
          <div className="no-scroll-bar" style={{ overflowX: "scroll" }}>
            <div style={{ minWidth }}>
              <ConfigProfileForm />
            </div>
          </div>
        )}
      </TableHeader>
    </DashboardLayout>
  );
};
