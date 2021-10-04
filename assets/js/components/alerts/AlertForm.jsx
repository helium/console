import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Button, Row, Col } from "antd";
import ArrowLeftOutlined from "@ant-design/icons/ArrowLeftOutlined";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import EditOutlined from "@ant-design/icons/EditOutlined";
import AddDeviceAlertIcon from "../../../img/alerts/device-label-alert-add-icon.svg";
import AddIntegrationAlertIcon from "../../../img/alerts/channel-alert-add-icon.svg";
import DeviceAlertIcon from "../../../img/alerts/alert-show-devices.svg";
import IntegrationAlertIcon from "../../../img/alerts/alert-show-integrations.svg";
import Text from "antd/lib/typography/Text";
import { useDispatch } from "react-redux";
import { createAlert, updateAlert } from "../../actions/alert";
import AlertSettings from "./AlertSettings";
import { ALERT_SHOW } from "../../graphql/alerts";
import { useQuery } from "@apollo/client";
import { SkeletonLayout } from "../common/SkeletonLayout";
import DeleteAlertModal from "./DeleteAlertModal";
import { useHistory } from "react-router-dom";
import UserCan from "../common/UserCan";
import analyticsLogger from "../../util/analyticsLogger";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";

export default (props) => {
  const history = useHistory();
  const [showDeleteAlertModal, setShowDeleteAlertModal] = useState(false);
  const dispatch = useDispatch();
  const { loading, error, data, refetch } = useQuery(ALERT_SHOW, {
    variables: { id: props.id },
    skip: !props.id,
  });
  const socket = useSelector((state) => state.apollo.socket);
  const alertType =
    props.show && data && data.alert ? data.alert.node_type : props.alertType;

  useEffect(() => {
    if (props.show) {
      const alertShowChannel = socket.channel("graphql:alert_show", {});

      // executed when mounted
      alertShowChannel.join();
      alertShowChannel.on(
        `graphql:alert_show:${props.id}:alert_update`,
        (_message) => {
          refetch();
        }
      );

      // executed when unmounted
      return () => {
        alertShowChannel.leave();
      };
    }
  }, []);

  const renderIcon = () => {
    if (props.show) {
      const ICONS = {
        "device/label": DeviceAlertIcon,
        integration: IntegrationAlertIcon,
      };
      return ICONS[alertType];
    } else {
      const ICONS = {
        "device/label": AddDeviceAlertIcon,
        integration: AddIntegrationAlertIcon,
      };
      return ICONS[alertType];
    }
  };

  const openDeleteAlertModal = () => {
    setShowDeleteAlertModal(true);
  };

  const closeDeleteAlertModal = () => {
    setShowDeleteAlertModal(false);
  };

  const renderTitle = () => {
    const TITLES = props.show
      ? {
          "device/label": "Device/Label Alert Settings",
          integration: "Integration Alert Settings",
        }
      : {
          "device/label": "New Device/Label Alert",
          integration: "New Integration Alert",
        };

    return TITLES[alertType];
  };

  return (
    <React.Fragment>
      <div style={{ padding: "30px 30px 20px 30px" }}>
        {!props.show && (
          <Button
            icon={<ArrowLeftOutlined />}
            style={{ border: "none" }}
            onClick={props.back}
          >
            Back
          </Button>
        )}
        {props.show && !error && (
          <UserCan>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
              }}
            >
              <Button
                size="middle"
                type="danger"
                style={{ borderRadius: 5, marginRight: 35 }}
                onClick={openDeleteAlertModal}
                icon={<DeleteOutlined />}
              >
                Delete Alert
              </Button>
            </div>
          </UserCan>
        )}
        <Row style={{ marginTop: "10px" }}>
          <Col span={10} style={{ padding: "70px 80px" }}>
            <img src={renderIcon()} />
            <h1 style={{ marginTop: 10, fontSize: "23px", fontWeight: 600 }}>
              {renderTitle()}
            </h1>
            <div>
              <p style={{ fontSize: "16px" }}>
                Alerts can be created for Device/Label Nodes or Integration
                Nodes.
              </p>
              <p>
                <a
                  className="help-link"
                  href="https://docs.helium.com/use-the-network/console/adr#alerts"
                  target="_blank"
                >
                  Learn more about alerts
                </a>
              </p>
            </div>
          </Col>
          <Col span={12} style={{ padding: "40px 20px" }}>
            {error && (
              <Text>
                Data failed to load, please reload the page and try again
              </Text>
            )}
            {loading && <SkeletonLayout />}
            {!error && !loading && (
              <AlertSettings
                alertType={alertType}
                save={(name, config) => {
                  if (props.show) {
                    analyticsLogger.logEvent("ACTION_UPDATE_ALERT", {
                      id: props.id,
                      config,
                    });
                    dispatch(
                      updateAlert(props.id, {
                        ...(name && { name }),
                        config,
                      })
                    );
                  } else {
                    analyticsLogger.logEvent("ACTION_CREATE_ALERT", {
                      node_type: props.alertType,
                      config,
                    });
                    dispatch(
                      createAlert({
                        name: name,
                        config,
                        node_type: props.alertType,
                      })
                    ).then((_) => {
                      history.push("/alerts");
                    });
                  }
                }}
                saveText={props.show ? "Update" : "Create"}
                saveIcon={props.show ? <EditOutlined /> : <PlusOutlined />}
                data={data}
                show={props.show}
              />
            )}
          </Col>
        </Row>
      </div>
      <DeleteAlertModal
        open={showDeleteAlertModal}
        alert={{ id: props.id, ...(data && { ...data.alert }) }}
        close={closeDeleteAlertModal}
      />
    </React.Fragment>
  );
};
