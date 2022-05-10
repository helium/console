import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import find from 'lodash/find'
import { ALL_CHANNELS } from "../../graphql/channels";
import withGql from "../../graphql/withGql";
import ChannelDashboardLayout from "./ChannelDashboardLayout";
import CommonForm from "./default/CommonForm.jsx";
import CargoForm from "./community/cargo/CargoForm.jsx";
import MyDevicesForm from "./community/my_devices/MyDevicesForm.jsx";
import AdafruitForm from "./community/adafruit/AdafruitForm.jsx";
import UbidotsForm from "./community/ubidots/UbidotsForm.jsx";
import DatacakeForm from "./community/datacake/DatacakeForm.jsx";
import TagoForm from "./community/tago/TagoForm.jsx";
import GoogleSheetForm from "./community/google_sheets/GoogleSheetForm.jsx";
import MicroshareForm from "./community/microshare/MicroshareForm.jsx";
import AkenzaForm from "./community/akenza/AkenzaForm";
import ChannelCreateRow from "./ChannelCreateRow";
import ChannelPremadeRow from "./ChannelPremadeRow";
import { MobileDisplay, DesktopDisplay } from "../mobile/MediaQuery";
import { createChannel } from "../../actions/channel";
import analyticsLogger from "../../util/analyticsLogger";
import { Card, Button, Collapse, Typography } from "antd";
const { Panel } = Collapse;
const { Text } = Typography;
import MobileLayout from "../mobile/MobileLayout";
import ArrowLeftOutlined from "@ant-design/icons/ArrowLeftOutlined";
import { CORE_INTEGRATION_TYPES, COMMUNITY_INTEGRATION_TYPES } from "../../util/integrationInfo";
import { isMobile } from "../../util/constants";

@connect(null, mapDispatchToProps)
class ChannelNew extends Component {
  state = {
    type: null,
  };

  componentDidMount() {
    analyticsLogger.logEvent(
      isMobile ? "ACTION_NAV_CHANNELS_NEW_MOBILE" : "ACTION_NAV_CHANNELS_NEW"
    );

    const { search } = this.props.history.location
    const searchParams = search.split("?type=")
    if ( searchParams[1] && find(COMMUNITY_INTEGRATION_TYPES, {type: searchParams[1]}) ) {
      this.setState({ type: searchParams[1] })
    }
  }

  handleSelectType = (type) => {
    if (type === "http" || type === "mqtt") {
      this.setState({ type })
    } else {
      this.props.history.replace(`/integrations/new/${type}`)
    }
  }

  resetType = (type) => {
    this.setState({ type: null })
    this.props.history.replace('/integrations/new')
  }

  renderForm = (mobile) => {
    const { type } = this.state

    switch (type) {
      case "cargo":
        return <CargoForm mobile={mobile} type={type} reset={this.resetType} createChannel={this.props.createChannel} />
      case "my_devices":
        return <MyDevicesForm mobile={mobile} type={type} reset={this.resetType} createChannel={this.props.createChannel} />
      case "adafruit":
        return <AdafruitForm mobile={mobile} type={type} reset={this.resetType} createChannel={this.props.createChannel} />
      case "ubidots":
        return <UbidotsForm mobile={mobile} type={type} reset={this.resetType} createChannel={this.props.createChannel} />
      case "datacake":
        return <DatacakeForm mobile={mobile} type={type} reset={this.resetType} createChannel={this.props.createChannel} />
      case "tago":
        return <TagoForm mobile={mobile} type={type} reset={this.resetType} createChannel={this.props.createChannel} />
      case "akenza":
        return <AkenzaForm mobile={mobile} type={type} reset={this.resetType} createChannel={this.props.createChannel} />
      case "google_sheets":
        return <GoogleSheetForm from="ChannelNew" mobile={mobile} type={type} reset={this.resetType} createChannel={this.props.createChannel} />
      case "microshare":
        return <MicroshareForm mobile={mobile} type={type} reset={this.resetType} createChannel={this.props.createChannel} />
      default:
        return <CommonForm mobile={mobile} type={type} reset={this.resetType} createChannel={this.props.createChannel} />
    }
  };

  render() {
    const { type } = this.state;
    const { allChannels } = this.props.allChannelsQuery;

    return (
      <>
        <MobileDisplay>
          <MobileLayout>
            <div
              style={{
                padding: "10px 15px",
                boxShadow: "0px 3px 7px 0px #ccc",
                backgroundColor: "#F5F7F9",
                height: 100,
                position: "relative",
                zIndex: 10,
              }}
            >
              <Button
                icon={<ArrowLeftOutlined style={{ fontSize: 12 }} />}
                style={{
                  border: "none",
                  padding: 0,
                  fontSize: 14,
                  color: "#2C79EE",
                  height: 24,
                  boxShadow: "none",
                  background: "none",
                  fontWeight: 600,
                }}
                onClick={() => {
                  this.props.history.push("/integrations");
                }}
              >
                Back to Integrations
              </Button>
              <div>
                <Text style={{ fontSize: 27, fontWeight: 600 }}>
                  Add New Integration
                </Text>
              </div>
            </div>
            <div
              style={{
                padding: "25px 15px",
                backgroundColor: "#ffffff",
                height: "calc(100% - 100px)",
                overflowY: "scroll",
              }}
            >
              {!type && (
                <div style={{ display: "block" }}>
                  {
                    CORE_INTEGRATION_TYPES.length > 0 && (
                      <Collapse
                        expandIconPosition="right"
                        defaultActiveKey={["1"]}
                        style={{ marginTop: 20 }}
                      >
                        <Panel
                          header={<b>ADD A CORE INTEGRATION</b>}
                          key="1"
                          style={{ padding: 0 }}
                        >
                          <ChannelCreateRow
                            selectType={this.handleSelectType}
                            mobile
                            allChannels={allChannels}
                          />
                        </Panel>
                      </Collapse>
                    )
                  }
                  {
                    COMMUNITY_INTEGRATION_TYPES.length > 0 && (
                      <Collapse
                        expandIconPosition="right"
                        defaultActiveKey={["1"]}
                        className="channel-new-panels-mobile"
                      >
                        <Panel header={<b>ADD A COMMUNITY INTEGRATION</b>} key="1">
                          <ChannelPremadeRow
                            selectType={this.handleSelectType}
                            mobile
                            allChannels={allChannels}
                          />
                        </Panel>
                      </Collapse>
                    )
                  }
                </div>
              )}

              {type && this.renderForm(true)}
            </div>
          </MobileLayout>
        </MobileDisplay>
        <DesktopDisplay>
          <ChannelDashboardLayout {...this.props}>
            <div style={{ padding: "30px 30px 20px 30px" }}>
              {!type && (
                <div style={{ display: "block" }}>
                  {
                    CORE_INTEGRATION_TYPES.length > 0 && (
                      <Card
                        size="small"
                        title="Add a Core Integration"
                        className="integrationcard"
                        bodyStyle={{ padding: 1 }}
                      >
                        <div
                          style={{
                            padding: 10,
                            height: "100%",
                            width: "100%",
                            overflowX: "scroll",
                          }}
                        >
                          <ChannelCreateRow selectType={this.handleSelectType} allChannels={allChannels} />
                        </div>
                      </Card>
                    )
                  }
                  {
                    COMMUNITY_INTEGRATION_TYPES.length > 0 && (
                      <Card
                        size="small"
                        title="Add a Community Integration"
                        className="integrationcard"
                        bodyStyle={{ padding: 1 }}
                      >
                        <div
                          style={{
                            padding: 10,
                            height: "100%",
                            width: "100%",
                            overflowX: "scroll",
                          }}
                        >
                          <ChannelPremadeRow selectType={this.handleSelectType} allChannels={allChannels} />
                        </div>
                      </Card>
                    )
                  }
                </div>
              )}

              {type && this.renderForm()}
            </div>
          </ChannelDashboardLayout>
        </DesktopDisplay>
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
    currentOrganizationId: state.organization.currentOrganizationId,
    socket: state.apollo.socket,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createChannel }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  withGql(ChannelNew, ALL_CHANNELS, (props) => ({
    fetchPolicy: "cache-first",
    name: "allChannelsQuery",
  }))
);
