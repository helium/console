import React from "react";
import { Typography, Button } from "antd";
const { Text } = Typography;
import UserCan from "../../common/UserCan";
import LabelNode from "../nodes/LabelNode";
import FunctionNode from "../nodes/FunctionNode";
import ChannelNode from "../nodes/ChannelNode";
import DeviceNode from "../nodes/DeviceNode";

const edgeContent = ({ id, elementsMap, onNodeDelete }) => {

  const renderNode = (node) => {
    if (node.type === "deviceNode") return <DeviceNode data={node.data} />
    if (node.type === "labelNode") return <LabelNode data={node.data} />
    if (node.type === "functionNode") return <FunctionNode data={node.data} />
    if (node.type === "channelNode") return <ChannelNode data={node.data} />
  }

  return (
    <div style={{ padding: "0px 40px 0px 40px", height: 'calc(100vh - 165px)', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
      <Text style={{ fontSize: 30, fontWeight: "bold", display: "block" }}>
        Selected Edge
      </Text>

      <div style={{ margin: 20, paddingBottom: 10, width: 300 }}>
        {renderNode(elementsMap[elementsMap[id].source])}
        <Text style={{ fontSize: 16, fontWeight: 400, display: "block", textAlign: 'center', margin: 10 }}>
          is currently connected to
        </Text>
        {renderNode(elementsMap[elementsMap[id].target])}
      </div>

      <UserCan>
        <Button
          style={{ borderRadius: 4, marginRight: 5, width: 140 }}
          danger
          onClick={(e) => {
            e.stopPropagation();
            onNodeDelete()
          }}
        >
          Remove Edge
        </Button>
      </UserCan>
    </div>
  )
}

export default edgeContent
