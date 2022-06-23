import React, { useState, useEffect, Fragment } from "react";
import { useDispatch } from "react-redux";
import {
  Button,
  Row,
  Col,
  Input,
  Typography,
  Slider,
  Switch,
  Alert,
} from "antd";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import EditOutlined from "@ant-design/icons/EditOutlined";
import {
  createPacketConfig,
  updatePacketConfig,
} from "../../actions/packetConfig";
import PacketConfigIcon from "../../../img/packet_config/packet-config-index-add-icon.svg";
import { useQuery } from "@apollo/client";
import { PACKET_CONFIG_SHOW } from "../../graphql/packetConfigs";
const { Text } = Typography;
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import UserCan, { userCan } from "../common/UserCan";
import analyticsLogger from "../../util/analyticsLogger";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import { SkeletonLayout } from "../common/SkeletonLayout";
import ErrorMessage from "../common/ErrorMessage";
import { Link } from "react-router-dom";

export default ({
  show,
  id,
  openDeletePacketConfigModal,
  orgHasPreferredHotspots,
}) => {
  const history = useHistory();
  const currentRole = useSelector((state) => state.organization.currentRole);
  const [name, setName] = useState("");
  const [multiBuyValue, setMultiBuyValue] = useState(1);
  const [packetConfigData, setPacketConfigData] = useState({});
  const [multiActive, setMultiActive] = useState(false);
  const [preferredActive, setPreferredActive] = useState(false);
  const dispatch = useDispatch();

  const { loading, error, data, refetch } = useQuery(PACKET_CONFIG_SHOW, {
    variables: { id },
    skip: !id,
  });

  const socket = useSelector((state) => state.apollo.socket);
  useEffect(() => {
    if (show) {
      const packetConfigShowChannel = socket.channel(
        "graphql:packet_config_show",
        {}
      );

      // executed when mounted
      packetConfigShowChannel.join();
      packetConfigShowChannel.on(
        `graphql:packet_config_show:${id}:packet_config_update`,
        (_message) => {
          refetch();
        }
      );

      // executed when unmounted
      return () => {
        packetConfigShowChannel.leave();
      };
    }
  }, []);

  useEffect(() => {
    if (!loading && !error && data) {
      setPacketConfigData({
        name: data.packetConfig.name,
        multiBuyValue: data.packetConfig.multi_buy_value,
        multiActive: data.packetConfig.multi_active,
        preferredActive: data.packetConfig.preferred_active,
      });
      setMultiBuyValue(data.packetConfig.multi_buy_value);
      setName(data.packetConfig.name);
      setMultiActive(data.packetConfig.multi_active);
      setPreferredActive(data.packetConfig.preferred_active);
    }
  }, [data]);

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
              onClick={() => openDeletePacketConfigModal(data.packetConfig)}
              icon={<DeleteOutlined />}
            >
              Delete Config
            </Button>
          </div>
        </UserCan>
      )}
      <Row style={{ marginTop: "10px" }}>
        <Col span={10} style={{ padding: "70px 80px" }}>
          <img src={PacketConfigIcon} />
          <h1 style={{ marginTop: 10, fontSize: "23px", fontWeight: 600 }}>
            Packet Configurations
          </h1>
          <div>
            <p style={{ fontSize: "16px" }}>
              Use to choose which Hotspots to receive packets from or how many
              packets to purchase from Hotspots (if available). A Packet
              Configuration requires either a Preferred Hotspot or a Multiple
              Packet setting.
            </p>
            <p>
              <a
                className="help-link"
                href="https://docs.helium.com/use-the-network/console/multi-packets"
                target="_blank"
              >
                Learn more about Packet Configurations
              </a>
            </p>
          </div>
        </Col>
        <Col span={12} style={{ padding: "40px 20px" }}>
          {error && <ErrorMessage />}
          {loading && <SkeletonLayout />}
          {!error && !loading && (
            <Fragment>
              <Text style={{ fontSize: "16px" }} strong>
                Packet Config Name
              </Text>
              <Input
                onChange={(e) => {
                  setName(e.target.value);
                }}
                value={name}
                placeholder={
                  show ? packetConfigData.name : "e.g. My Packet Config"
                }
                suffix={`${name.length}/25`}
                maxLength={25}
                disabled={!userCan({ role: currentRole })}
              />

              <div style={{ marginTop: 40, width: "90%" }}>
                <Row gutter={[8, 16]}>
                  <Col span={4}>
                    <Switch
                      checked={preferredActive}
                      onChange={(active) => {
                        setPreferredActive(active);
                        if (active && multiActive) {
                          setMultiActive(false);
                        }
                      }}
                      disabled={
                        !userCan({ role: currentRole }) ||
                        !orgHasPreferredHotspots
                      }
                    />
                  </Col>
                  <Col span={20}>
                    <Text style={{ fontSize: 18, fontWeight: 600 }}>
                      Preferred Hotspots
                    </Text>
                    <Text
                      style={{
                        display: "block",
                        fontSize: 14,
                        fontWeight: 400,
                      }}
                    >
                      If this setting is chosen, packets will ONLY be purchased
                      from the selected Preferred Hotspots.
                    </Text>
                    {!orgHasPreferredHotspots && (
                      <Alert
                        style={{ marginTop: 10 }}
                        message={
                          <Text>
                            Your Organization must have Preferred Hotspots to
                            enable this setting. To prefer a hotspot, please
                            visit the{" "}
                            <Link
                              to={"/coverage"}
                              style={{ textDecoration: "underline" }}
                            >
                              Coverage Page
                            </Link>
                            .
                          </Text>
                        }
                        type="warning"
                      />
                    )}
                  </Col>
                  <Col span={4}>
                    <Switch
                      checked={multiActive}
                      onChange={(active) => {
                        setMultiActive(active);
                        if (active && preferredActive) {
                          setPreferredActive(false);
                        }
                      }}
                      disabled={!userCan({ role: currentRole })}
                    />
                  </Col>
                  <Col span={20}>
                    <Text style={{ fontSize: 18, fontWeight: 600 }}>
                      Multiple Packets
                    </Text>
                    <Text
                      style={{
                        display: "block",
                        fontSize: 14,
                        fontWeight: 400,
                      }}
                    >
                      How many packets do you want to purchase (if available)?
                    </Text>
                    <div
                      style={{ width: "100%", marginBottom: 12, marginTop: 20 }}
                    >
                      <Slider
                        value={multiBuyValue}
                        min={1}
                        max={21}
                        tooltipVisible={false}
                        onChange={(value) => setMultiBuyValue(value)}
                        disabled={
                          !userCan({ role: currentRole }) || !multiActive
                        }
                      />
                    </div>

                    <p
                      style={{
                        color: !multiActive ? "#bbbbbb" : "#096DD9",
                        fontSize: 16,
                        fontWeight: 500,
                      }}
                    >
                      {(!multiBuyValue || multiBuyValue === 1) &&
                        "Just 1 Packet"}
                      {multiBuyValue > 1 &&
                        multiBuyValue < 21 &&
                        `Up to ${multiBuyValue} Packets`}
                      {multiBuyValue === 21 && `All Available Packets`}
                    </p>
                  </Col>
                </Row>
              </div>

              <UserCan>
                <Button
                  icon={show ? <EditOutlined /> : <PlusOutlined />}
                  type="primary"
                  style={{
                    borderColor: "#2C79EE",
                    backgroundColor: "#2C79EE",
                    borderRadius: 50,
                    text: "white",
                    marginTop: 40,
                  }}
                  onClick={() => {
                    if (show) {
                      analyticsLogger.logEvent("ACTION_UPDATE_PACKET_CONFIG", {
                        id,
                        multiBuyValue: multiBuyValue,
                      });
                      dispatch(
                        updatePacketConfig(id, {
                          ...(name && { name }),
                          multiBuyValue,
                          multiActive,
                          preferredActive,
                        })
                      );
                    } else {
                      analyticsLogger.logEvent("ACTION_CREATE_PACKET_CONFIG", {
                        id,
                        name,
                        multiBuyValue,
                        multiActive,
                        preferredActive,
                      });
                      dispatch(
                        createPacketConfig({
                          name,
                          multiBuyValue,
                          multiActive,
                          preferredActive,
                        })
                      ).then(() => {
                        history.push("/packets");
                      });
                    }
                  }}
                >
                  {show ? "Update" : "Create"} Packet Config
                </Button>
              </UserCan>
            </Fragment>
          )}
        </Col>
      </Row>
    </div>
  );
};
