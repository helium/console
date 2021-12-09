import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import DashboardLayout from "../common/DashboardLayout";
import TableHeader from "../common/TableHeader";
import { MobileDisplay, DesktopDisplay } from '../mobile/MediaQuery'
import MultiBuyForm from "./MultiBuyForm";
import MultiBuyBar from "./MultiBuyBar";
import MultiBuyIndexTable from "./MultiBuyIndexTable";
import DeleteMultiplePacketModal from "./DeleteMultiplePacketModal";
import PlusIcon from "../../../img/multi_buy/multi-buy-index-plus-icon.svg";
import AllIcon from "../../../img/multi_buy/multi-buy-index-all-icon.svg";
import { ALL_MULTI_BUYS } from "../../graphql/multiBuys";
import { useQuery } from "@apollo/client";
import { SkeletonLayout } from "../common/SkeletonLayout";
import { useHistory } from "react-router-dom";
import analyticsLogger from "../../util/analyticsLogger";
import { minWidth } from "../../util/constants";

export default (props) => {
  const history = useHistory();

  const [showPage, setShowPage] = useState("allMultiBuy");
  const [showDeleteMultiplePacketModal, setShowDeleteMultiplePacketModal] =
    useState(false);
  const [selectedMultiplePacket, setSelectedMultiplePacket] = useState(null);

  const { loading, error, data, refetch } = useQuery(ALL_MULTI_BUYS, {
    fetchPolicy: "cache-first",
  });
  const multiBuyData = data ? data.allMultiBuys : [];

  const openDeleteMultiplePacketModal = (multi_buy) => {
    setShowDeleteMultiplePacketModal(true);
    setSelectedMultiplePacket(multi_buy);
  };

  const closeDeleteMultiplePacketModal = () => {
    setShowDeleteMultiplePacketModal(false);
    setSelectedMultiplePacket(null);
  };

  const socket = useSelector((state) => state.apollo.socket);
  const currentOrganizationId = useSelector(
    (state) => state.organization.currentOrganizationId
  );
  const multiBuysChannel = socket.channel("graphql:multi_buys_index_table", {});
  useEffect(() => {
    // executed when mounted
    multiBuysChannel.join();
    multiBuysChannel.on(
      `graphql:multi_buys_index_table:${currentOrganizationId}:multi_buy_list_update`,
      (_message) => {
        refetch();
      }
    );
    analyticsLogger.logEvent("ACTION_NAV_MULTIBUY_INDEX");

    // executed when unmounted
    return () => {
      multiBuysChannel.leave();
    };
  }, []);

  useEffect(() => {
    if (props.match.params.id) {
      setShowPage("showMultiBuy");
    } else if (props.match.path === "/multi_buys/new") {
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
        <DashboardLayout title="Multiple Packets" user={props.user}>
          <TableHeader
            backgroundColor="#D3E0EE"
            otherColor="#ACC6DD"
            homeIcon={null}
            goToAll={() => {
              history.push("/multi_buys");
              setShowPage("allMultiBuy");
            }}
            allIcon={AllIcon}
            textColor="#3C6B95"
            allText="All Multiple Packets"
            allButtonStyles={{ width: 160 }}
            onAllPage={showPage === "allMultiBuy"}
            onNewPage={showPage === "new"}
            addIcon={PlusIcon}
            goToNew={() => {
              history.push("/multi_buys/new");
              setShowPage("new");
            }}
            noHome
            borderRadius="25px"
            extraContent={
              <MultiBuyBar
                shownMultiBuyId={props.match.params.id}
                multiBuys={multiBuyData}
              />
            }
            newText="Add New Multiple Packet Config"
          >
            {showPage === "allMultiBuy" && error && (
              <div style={{ padding: 40 }}>
                <Text>
                  Data failed to load, please reload the page and try again
                </Text>
              </div>
            )}
            {showPage === "allMultiBuy" && loading && (
              <div style={{ padding: 40 }}>
                <SkeletonLayout />
              </div>
            )}
            {showPage === "allMultiBuy" && !loading && (
              <MultiBuyIndexTable
                data={multiBuyData}
                openDeleteMultiplePacketModal={openDeleteMultiplePacketModal}
                history={history}
              />
            )}
            {showPage === "new" && (
              <div className="no-scroll-bar" style={{ overflowX: "scroll" }}>
                <div style={{ minWidth }}>
                  <MultiBuyForm />
                </div>
              </div>
            )}
            {props.match.params.id && showPage === "showMultiBuy" && (
              <div className="no-scroll-bar" style={{ overflowX: "scroll" }}>
                <div style={{ minWidth }}>
                  <MultiBuyForm
                    id={props.match.params.id}
                    show
                    openDeleteMultiplePacketModal={openDeleteMultiplePacketModal}
                  />
                </div>
              </div>
            )}
          </TableHeader>

          <DeleteMultiplePacketModal
            open={showDeleteMultiplePacketModal}
            selected={selectedMultiplePacket}
            close={closeDeleteMultiplePacketModal}
          />
        </DashboardLayout>
      </DesktopDisplay>
    </>
  );
};
