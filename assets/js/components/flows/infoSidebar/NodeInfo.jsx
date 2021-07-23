import React, { useState } from "react";
import FilledFunctionIcon from "../../../../img/filled-function-node-icon.svg";
import FilledChannelNodeIcon from "../../../../img/filled-channel-node-icon.svg";
import FilledLabelNodeIcon from "../../../../img/filled-label-node-icon.svg";
import FilledDeviceNodeIcon from "../../../../img/filled-device-node-icon.svg";
import FunctionContent from "./FunctionContent";
import ChannelContent from "./ChannelContent";
import DeviceContent from "./DeviceContent";
import LabelContent from "./LabelContent";
import DeleteNodeModal from "./DeleteNodeModal";
import EdgeContent from "./EdgeContent";

export default ({
  id,
  type,
  onAdrUpdate,
  onLabelSidebarDevicesUpdate,
  onMultiBuyUpdate,
  onAlertUpdate,
  deleteNode,
  hasConnectedEdges,
  elementsMap,
  onCFListUpdate,
}) => {
  const [openNodeDeleteModal, setOpenNodeDeleteModal] = useState(false);

  const onNodeDelete = () => {
    if (hasConnectedEdges) setOpenNodeDeleteModal(true);
    else deleteNode();
  };

  const renderTopIcon = () => {
    switch (type) {
      case "function":
        return <img src={FilledFunctionIcon} style={{ height: 50 }} />;
      case "device":
        return <img src={FilledDeviceNodeIcon} style={{ height: 50 }} />;
      case "label":
        return <img src={FilledLabelNodeIcon} style={{ height: 50 }} />;
      case "utility":
        return null;
      case "channel":
        return <img src={FilledChannelNodeIcon} style={{ height: 50 }} />;
    }
  };

  const renderMain = (fxn) => {
    switch (type) {
      case "function":
        return (
          <FunctionContent
            id={id}
            type={type}
            onAlertUpdate={onAlertUpdate}
            onNodeDelete={onNodeDelete}
          />
        );
      case "device":
        return (
          <DeviceContent
            id={id}
            type={type}
            onAdrUpdate={onAdrUpdate}
            onMultiBuyUpdate={onMultiBuyUpdate}
            onAlertUpdate={onAlertUpdate}
            onNodeDelete={onNodeDelete}
            onCFListUpdate={onCFListUpdate}
          />
        );
      case "utility":
        return null;
      case "label":
        return (
          <LabelContent
            id={id}
            type={type}
            onLabelSidebarDevicesUpdate={onLabelSidebarDevicesUpdate}
            onAdrUpdate={onAdrUpdate}
            onMultiBuyUpdate={onMultiBuyUpdate}
            onAlertUpdate={onAlertUpdate}
            onNodeDelete={onNodeDelete}
            onCFListUpdate={onCFListUpdate}
          />
        );
      case "channel":
        return (
          <ChannelContent
            id={id}
            type={type}
            onAlertUpdate={onAlertUpdate}
            onNodeDelete={onNodeDelete}
          />
        );
      case "edge":
        return (
          <EdgeContent
            elementsMap={elementsMap}
            id={id}
            onNodeDelete={onNodeDelete}
          />
        );
    }
  };

  return (
    <React.Fragment>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          paddingRight: 40,
        }}
      >
        {renderTopIcon()}
      </div>
      <div style={{ marginTop: 20 }}>{renderMain()}</div>
      <DeleteNodeModal
        type={type}
        open={openNodeDeleteModal}
        deleteNode={deleteNode}
        onClose={() => {
          setOpenNodeDeleteModal(false);
        }}
      />
    </React.Fragment>
  );
};
