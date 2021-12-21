import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQuery } from "@apollo/client";
import FunctionDashboardLayout from "./FunctionDashboardLayout";
import { MobileDisplay, DesktopDisplay } from "../mobile/MediaQuery";
import UserCan from "../common/UserCan";
import FunctionValidator from "./FunctionValidator";
import DeleteFunctionModal from "./DeleteFunctionModal";
import GoogleSheetForm from "../channels/forms/GoogleSheetForm";
import { FUNCTION_SHOW } from "../../graphql/functions";
import { updateFunction } from "../../actions/function";
import analyticsLogger from "../../util/analyticsLogger";
import { minWidth } from "../../util/constants";
import { Typography, Card, Button } from "antd";
import PauseOutlined from "@ant-design/icons/PauseOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import CaretRightOutlined from "@ant-design/icons/CaretRightOutlined";
import { SkeletonLayout } from "../common/SkeletonLayout";
const { Text } = Typography;
import FunctionDetailsCard from "./FunctionDetailsCard";
import { customFunctionBody } from "./FunctionNew";
import ErrorMessage from "../common/ErrorMessage";

export default (props) => {
  const functionId = props.match.params.id;
  const dispatch = useDispatch();

  const [name, setName] = useState("");
  const [type, setType] = useState(undefined);
  const [format, setFormat] = useState(undefined);
  const [body, setBody] = useState("");
  const [showDeleteFunctionModal, setShowDeleteFunctionModal] = useState(false);

  const socket = useSelector((state) => state.apollo.socket);
  const channel = socket.channel("graphql:function_show", {});

  const { loading, error, data, refetch } = useQuery(FUNCTION_SHOW, {
    variables: { id: functionId },
    skip: !functionId,
  });
  const fxn = data ? data.function : {};

  useEffect(() => {
    // executed when mounted
    analyticsLogger.logEvent("ACTION_NAV_FUNCTION_SHOW", { id: functionId });

    channel.join();
    channel.on(
      `graphql:function_show:${functionId}:function_update`,
      (_message) => {
        refetch();
      }
    );

    // executed when unmounted
    return () => {
      channel.leave();
    };
  }, []);

  useEffect(() => {
    if (fxn) {
      setName(fxn.name);
      setType(fxn.type);
      setFormat(fxn.format);
      setBody(fxn.body);
    }
  }, [fxn]);

  const handleInputUpdate = (e) => setName(e.target.value);

  const handleSelectFunctionType = () => setType("decoder");

  const handleSelectFormat = (format) => {
    setFormat(format);
    if (format === "custom") {
      setBody(customFunctionBody);
    }
  };

  const handleFunctionUpdate = (body) => {
    setBody(body);
  };

  const handleSubmit = () => {
    const newAttrs = {};

    if (name.length > 0 && name !== fxn.name) newAttrs.name = name;
    if (type && type !== fxn.type) newAttrs.type = type;
    if (format && format !== fxn.format) newAttrs.format = format;
    if (
      (format === "custom" || (fxn.format === "custom" && !format)) &&
      fxn.body !== body
    )
      newAttrs.body = body;

    if (Object.keys(newAttrs).length > 0) {
      dispatch(updateFunction(functionId, newAttrs));
      analyticsLogger.logEvent("ACTION_UPDATE_FUNCTION_DETAILS", {
        id: functionId,
        attrs: newAttrs,
      });
    }
  };

  const clearInputs = () => {
    setName(fxn.name);
    setType(fxn.type);
    setFormat(fxn.format);
    setBody(fxn.body);
  };

  const openDeleteFunctionModal = () => {
    setShowDeleteFunctionModal(true);
  };

  const closeDeleteFunctionModal = () => {
    setShowDeleteFunctionModal(false);
  };

  if (loading) {
    return (
      <>
        <MobileDisplay />
        <DesktopDisplay>
          <FunctionDashboardLayout {...props}>
            <div style={{ padding: 40 }}>
              <SkeletonLayout />
            </div>
          </FunctionDashboardLayout>
        </DesktopDisplay>
      </>
    );
  }
  if (error) {
    return (
      <>
        <MobileDisplay />
        <DesktopDisplay>
          <FunctionDashboardLayout {...props}>
            <ErrorMessage />
          </FunctionDashboardLayout>
        </DesktopDisplay>
      </>
    );
  }

  return (
    <>
      <MobileDisplay />
      <DesktopDisplay>
        <FunctionDashboardLayout {...props}>
          <div className="no-scroll-bar" style={{ overflowX: "scroll" }}>
            <div
              className="show-page"
              style={{
                minWidth,
              }}
            >
              <div className="show-header">
                <Text style={{ fontSize: 24, fontWeight: 600 }}>
                  {fxn.name}
                </Text>
                <UserCan>
                  <div className="show-buttons">
                    <Button
                      style={{ borderRadius: 4, marginRight: 12 }}
                      type="default"
                      icon={
                        fxn.active ? <PauseOutlined /> : <CaretRightOutlined />
                      }
                      onClick={() => {
                        dispatch(
                          updateFunction(fxn.id, {
                            active: !fxn.active,
                          })
                        );
                        analyticsLogger.logEvent(
                          "ACTION_UPDATE_FUNCTION_ACTIVE",
                          {
                            id: fxn.id,
                            active: !fxn.active,
                          }
                        );
                      }}
                    >
                      {fxn.active ? "Pause" : "Start"} Function
                    </Button>
                    <Button
                      style={{ borderRadius: 4 }}
                      type="danger"
                      icon={<DeleteOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteFunctionModal();
                      }}
                    >
                      Delete Function
                    </Button>
                  </div>
                </UserCan>
              </div>

              <FunctionDetailsCard
                fxn={fxn}
                name={name}
                type={type}
                format={format}
                body={body}
                handleSelectFunctionType={handleSelectFunctionType}
                handleInputUpdate={handleInputUpdate}
                handleSelectFormat={handleSelectFormat}
                clearInputs={clearInputs}
                handleSubmit={handleSubmit}
                horizontal={true}
              />

              <UserCan>
                {fxn.format === "custom" &&
                  fxn.body.indexOf("Google Form") !== -1 && (
                    <Card title="Google Form Fields">
                      <GoogleSheetForm />
                    </Card>
                  )}
              </UserCan>

              {(format === "custom" ||
                (fxn.format === "custom" && !format)) && (
                <FunctionValidator
                  handleFunctionUpdate={handleFunctionUpdate}
                  body={body && body.length > 0 ? body : ""}
                  title="Custom Script"
                />
              )}

              <DeleteFunctionModal
                open={showDeleteFunctionModal}
                onClose={closeDeleteFunctionModal}
                functionToDelete={fxn}
                redirect
              />
            </div>
          </div>
        </FunctionDashboardLayout>
      </DesktopDisplay>
    </>
  );
};
