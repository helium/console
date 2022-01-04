import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Button, Row, Col } from "antd";
import { useQuery } from "@apollo/client";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import EditOutlined from "@ant-design/icons/EditOutlined";
import ConfigProfileIcon from "../../../img/config_profile/profile_icon_blue.svg";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import UserCan from "../common/UserCan";
import analyticsLogger from "../../util/analyticsLogger";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import { SkeletonLayout } from "../common/SkeletonLayout";
import { CONFIG_PROFILE_SHOW } from "../../graphql/configProfiles";
import {
  createConfigProfile,
  updateConfigProfile,
} from "../../actions/configProfile";
import ConfigProfileSettings from "./ConfigProfileSettings";
import ErrorMessage from "../common/ErrorMessage";

export default ({ show, id, openDeleteConfigProfileModal }) => {
  const history = useHistory();
  const dispatch = useDispatch();

  const { loading, error, data, refetch } = useQuery(CONFIG_PROFILE_SHOW, {
    variables: { id },
    skip: !id,
  });

  const socket = useSelector((state) => state.apollo.socket);
  useEffect(() => {
    if (show) {
      const configProfileShowChannel = socket.channel(
        "graphql:config_profile_show",
        {}
      );

      // executed when mounted
      configProfileShowChannel.join();
      configProfileShowChannel.on(
        `graphql:config_profile_show:${id}:config_profile_update`,
        (_message) => {
          refetch();
        }
      );

      // executed when unmounted
      return () => {
        configProfileShowChannel.leave();
      };
    }
  }, []);

  return (
    <div style={{ padding: "30px 30px 20px 30px" }}>
      {show && !error && (
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
              style={{ borderRadius: 5, marginRight: 50 }}
              onClick={() => openDeleteConfigProfileModal(data.configProfile)}
              icon={<DeleteOutlined />}
            >
              Delete Profile
            </Button>
          </div>
        </UserCan>
      )}
      <Row style={{ marginTop: "10px" }}>
        <Col span={10} style={{ padding: "70px 80px" }}>
          <img src={ConfigProfileIcon} />
          <h1 style={{ marginTop: 10, fontSize: "23px", fontWeight: 600 }}>
            Profiles
          </h1>
          <div>
            <p style={{ fontSize: "16px" }}>
              Configuration Profiles can be added to device/label nodes. Devices
              and labels can only have one profile applied to them.
            </p>
            <p>
              <a
                className="help-link"
                href="https://docs.helium.com/use-the-network/console/profiles"
                target="_blank"
              >
                Learn more about Profiles
              </a>
            </p>
          </div>
        </Col>
        <Col span={12} style={{ padding: "40px 20px" }}>
          {error && <ErrorMessage />}
          {loading && <SkeletonLayout />}
          {!error && !loading && (
            <ConfigProfileSettings
              save={({ adrAllowed, cfListEnabled, name, rxDelay }) => {
                if (show) {
                  analyticsLogger.logEvent("ACTION_UPDATE_CONFIG_PROFILE", {
                    id,
                    adrAllowed,
                    cfListEnabled,
                    rxDelay
                  });
                  dispatch(
                    updateConfigProfile(id, {
                      ...(name && { name }),
                      adr_allowed: adrAllowed,
                      cf_list_enabled: cfListEnabled,
                      rx_delay: rxDelay,
                    })
                  );
                } else {
                  analyticsLogger.logEvent("ACTION_CREATE_CONFIG_PROFILE", {
                    id,
                    adrAllowed,
                    cfListEnabled,
                    rxDelay,
                  });
                  dispatch(
                    createConfigProfile({
                      name,
                      adr_allowed: adrAllowed,
                      cf_list_enabled: cfListEnabled,
                      rx_delay: rxDelay,
                    })
                  ).then(() => {
                    history.push("/config_profiles");
                  });
                }
              }}
              saveIcon={show ? <EditOutlined /> : <PlusOutlined />}
              data={data}
              show={show}
            />
          )}
        </Col>
      </Row>
    </div>
  );
};
