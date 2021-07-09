import React, { useEffect } from "react";
import BugOutlined from "@ant-design/icons/BugOutlined";
import CloseOutlined from "@ant-design/icons/CloseOutlined";
import MenuOutlined from "@ant-design/icons/MenuOutlined";
import { Button, Tabs } from "antd";
const { TabPane } = Tabs;
import { useStoreActions } from "react-flow-renderer";
import Debug from "../../common/Debug";
import { debugSidebarBackgroundColor } from "../../../util/colors";

export default ({ toggle, show, width, debug, children, id, type }) => {
  const setSelectedElements = useStoreActions(
    (actions) => actions.setSelectedElements
  );

  useEffect(() => {}, [id]);

  const handleToggle = () => {
    toggle();
    setSelectedElements([]);
  };

  const inspectorContent = () => (
    <div
      style={{
        background: "white",
        padding: 0,
        transition: "all 0.5s ease",
        overflowY: "scroll",
        height: "calc(100vh - 55px)",
      }}
    >
      {show && (
        <React.Fragment>
          <Button
            style={{ border: "none", top: "50px", left: "35px" }}
            onClick={handleToggle}
            icon={<CloseOutlined style={{ fontSize: 30, color: "#D2DDE8" }} />}
          />
          {children}
        </React.Fragment>
      )}
    </div>
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 55,
        width: show ? width : 0,
        right: 0,
        zIndex: show ? 10 : 1,
        boxShadow:
          "10px 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
      }}
      key={id}
    >
      {show && debug && (
        <Tabs
          type="card"
          tabBarStyle={{
            transform: "rotate(-90deg)",
            position: "fixed",
            right: "464px",
            top: "200px",
            zIndex: "-1",
          }}
          defaultActiveKey="inspector"
        >
          <TabPane
            tab={
              <span>
                Debug <BugOutlined style={{ margin: "0px 0px 0px 6px" }} />
              </span>
            }
            key="debug"
          >
            <div
              style={{
                backgroundColor: debugSidebarBackgroundColor,
                height: "calc(100vh - 55px)",
                paddingTop: 50,
              }}
            >
              <Debug
                key={id}
                {...(type === "device" && { deviceId: id })}
                {...(type === "label" && { labelId: id })}
                entryWidth={500}
                handleToggle={handleToggle}
              />
            </div>
          </TabPane>
          <TabPane
            tab={
              <span>
                Inspector
                <MenuOutlined style={{ margin: "0px 0px 0px 6px" }} />
              </span>
            }
            key="inspector"
          >
            {inspectorContent()}
          </TabPane>
        </Tabs>
      )}
      {show && !debug && inspectorContent()}
    </div>
  );
};
