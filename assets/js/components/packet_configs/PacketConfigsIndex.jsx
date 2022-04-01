import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import DashboardLayout from "../common/DashboardLayout";
import TableHeader from "../common/TableHeader";
import { MobileDisplay, DesktopDisplay } from "../mobile/MediaQuery";
import PacketConfigForm from "./PacketConfigForm";
import PacketConfigBar from "./PacketConfigBar";
import PacketConfigIndexTable from "./PacketConfigIndexTable";
import DeletePacketConfigModal from "./DeletePacketConfigModal";
import PlusIcon from "../../../img/packet_config/packet-config-index-plus-icon.svg";
import AllIcon from "../../../img/packet_config/packet-config-index-all-icon.svg";
import { ALL_PACKET_CONFIGS } from "../../graphql/packetConfigs";
import { ALL_PREFERRED_HOTSPOTS } from "../../graphql/coverage";
import { useQuery } from "@apollo/client";
import { SkeletonLayout } from "../common/SkeletonLayout";
import { useHistory } from "react-router-dom";
import analyticsLogger from "../../util/analyticsLogger";
import { minWidth } from "../../util/constants";
import ErrorMessage from "../common/ErrorMessage";

export default (props) => {
  const history = useHistory();

  const [showPage, setShowPage] = useState("allPacketConfigs");
  const [showDeletePacketConfigModal, setShowDeletePacketConfigModal] =
    useState(false);
  const [selectedPacketConfig, setSelectedPacketConfig] = useState(null);

  const { loading, error, data, refetch } = useQuery(ALL_PACKET_CONFIGS, {
    fetchPolicy: "cache-first",
  });
  const packetConfigData = data ? data.allPacketConfigs : [];

  const {
    data: allPreferredHotspotsData,
    refetch: allPreferredHotspotsRefetch,
  } = useQuery(ALL_PREFERRED_HOTSPOTS, {
    fetchPolicy: "cache-and-network",
  });
  const allPreferredHotspots = allPreferredHotspotsData
    ? allPreferredHotspotsData.allPreferredHotspots
    : [];

  const openDeletePacketConfigModal = (packet_config) => {
    setShowDeletePacketConfigModal(true);
    setSelectedPacketConfig(packet_config);
  };

  const closeDeletePacketConfigModal = () => {
    setShowDeletePacketConfigModal(false);
    setSelectedPacketConfig(null);
  };

  const socket = useSelector((state) => state.apollo.socket);
  const currentOrganizationId = useSelector(
    (state) => state.organization.currentOrganizationId
  );
  const packetConfigsChannel = socket.channel(
    "graphql:packet_configs_index_table",
    {}
  );
  useEffect(() => {
    // executed when mounted
    packetConfigsChannel.join();
    packetConfigsChannel.on(
      `graphql:packet_configs_index_table:${currentOrganizationId}:packet_config_list_update`,
      (_message) => {
        refetch();
      }
    );
    analyticsLogger.logEvent("ACTION_NAV_PACKET_CONFIG_INDEX");

    // executed when unmounted
    return () => {
      packetConfigsChannel.leave();
    };
  }, []);

  useEffect(() => {
    if (props.match.params.id) {
      setShowPage("showPacketConfig");
    } else if (props.match.path === "/packets/new") {
      setShowPage("new");
    }
  });

  useEffect(() => {
    if (!props.match.params.id) {
      refetch();
    }
  }, [props.match.params.id]);

  return (
    <>
      <MobileDisplay />
      <DesktopDisplay>
        <DashboardLayout title="Packet Configurations" user={props.user}>
          <TableHeader
            backgroundColor="#D3E0EE"
            otherColor="#ACC6DD"
            homeIcon={null}
            goToAll={() => {
              history.push("/packets");
              setShowPage("allPacketConfigs");
            }}
            allIcon={AllIcon}
            textColor="#3C6B95"
            allText="All Packet Configs"
            allButtonStyles={{ width: 160 }}
            onAllPage={showPage === "allPacketConfigs"}
            onNewPage={showPage === "new"}
            addIcon={PlusIcon}
            goToNew={() => {
              history.push("/packets/new");
              setShowPage("new");
            }}
            noHome
            borderRadius="25px"
            extraContent={
              <PacketConfigBar
                shownPacketConfigId={props.match.params.id}
                packetConfigs={packetConfigData}
              />
            }
            newText="Add New Packet Config"
          >
            {showPage === "allPacketConfigs" && error && <ErrorMessage />}
            {showPage === "allPacketConfigs" && loading && (
              <div style={{ padding: 40 }}>
                <SkeletonLayout />
              </div>
            )}
            {showPage === "allPacketConfigs" && !loading && !error && (
              <PacketConfigIndexTable
                data={packetConfigData}
                openDeletePacketConfigModal={openDeletePacketConfigModal}
                history={history}
                orgHasPreferredHotspots={allPreferredHotspots.length > 0}
              />
            )}
            {showPage === "new" && (
              <div className="no-scroll-bar" style={{ overflowX: "scroll" }}>
                <div style={{ minWidth }}>
                  <PacketConfigForm
                    orgHasPreferredHotspots={allPreferredHotspots.length > 0}
                  />
                </div>
              </div>
            )}
            {props.match.params.id && showPage === "showPacketConfig" && (
              <div className="no-scroll-bar" style={{ overflowX: "scroll" }}>
                <div style={{ minWidth }}>
                  <PacketConfigForm
                    id={props.match.params.id}
                    show
                    openDeletePacketConfigModal={openDeletePacketConfigModal}
                    orgHasPreferredHotspots={allPreferredHotspots.length > 0}
                  />
                </div>
              </div>
            )}
          </TableHeader>

          <DeletePacketConfigModal
            open={showDeletePacketConfigModal}
            selected={selectedPacketConfig}
            close={closeDeletePacketConfigModal}
          />
        </DashboardLayout>
      </DesktopDisplay>
    </>
  );
};
