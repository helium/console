import React, { Component } from "react";
import { Typography } from "antd";
import { functionFormats } from "../functions/constants";
import EnterOutlined from "@ant-design/icons/EnterOutlined";
import AppstoreOutlined from "@ant-design/icons/AppstoreOutlined";
import ApiOutlined from "@ant-design/icons/ApiOutlined";
import UserOutlined from "@ant-design/icons/UserOutlined";
import DashboardOutlined from "@ant-design/icons/DashboardOutlined";
import ProfileOutlined from "@ant-design/icons/ProfileOutlined";
import WalletOutlined from "@ant-design/icons/WalletOutlined";
import CaretRightOutlined from "@ant-design/icons/CaretRightOutlined";
const { Text } = Typography;

class SearchResult extends Component {
  renderDescriptionText = () => {
    const { result } = this.props;
    if (result.category === "functions") {
      return functionFormats[result.description];
    }
    if (result.description === "device/label alert") {
      return "Device/Label alert";
    }
    if (result.description === "integration alert") {
      return "Integration alert";
    }
    return result.description;
  };

  render() {
    const { selected, result, gotoResult } = this.props;
    return (
      <div
        onClick={() => gotoResult(result)}
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          cursor: "pointer",
          backgroundColor: selected ? "#E3F2FD" : "white",
          padding: 15,
          borderRadius: 4,
        }}
        className="result"
      >
        {false && <SearchResultIcon category={result.category} />}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Text strong>{result.title}</Text>
          <Text type="secondary">{this.renderDescriptionText()}</Text>
        </div>
        <div style={{ flexGrow: 1 }} />
        <JumpTo show={selected} />
      </div>
    );
  }
}

const JumpTo = (props) => (
  <span className="jumpto">
    {props.show && (
      <span className="jumpto--inner">
        Go <EnterOutlined style={{ fontSize: 18 }} />
      </span>
    )}
  </span>
);

const SearchResultIcon = (props) => {
  switch (props.category) {
    case "devices":
      return <AppstoreOutlined style={{ fontSize: 18, marginRight: 20 }} />;
    case "channels":
      return <ApiOutlined style={{ fontSize: 18, marginRight: 20 }} />;
    case "users":
      return <UserOutlined style={{ fontSize: 18, marginRight: 20 }} />;
    case "dashboard":
      return <DashboardOutlined style={{ fontSize: 18, marginRight: 20 }} />;
    case "profile":
      return <ProfileOutlined style={{ fontSize: 18, marginRight: 20 }} />;
    case "datacredits":
      return <WalletOutlined style={{ fontSize: 18, marginRight: 20 }} />;
    default:
      return <CaretRightOutlined style={{ fontSize: 18, marginRight: 20 }} />;
  }
};

export default SearchResult;
