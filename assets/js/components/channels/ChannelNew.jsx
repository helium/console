import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import ChannelDashboardLayout from "./ChannelDashboardLayout";
import AzureHubForm from "./default/AzureHubForm.jsx";
import AzureCentralForm from "./default/AzureCentralForm.jsx";
import AWSForm from "./default/AWSForm.jsx";
import GoogleForm from "./default/GoogleForm.jsx";
import MQTTForm from "./default/MQTTForm.jsx";
import HTTPForm from "./default/HTTPForm.jsx";
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
  }

  handleSelectType = (type) => {
    this.setState({ type })
  }

  renderForm = (mobile) => {
    const { type } = this.state

    switch (type) {
      case "aws":
        return <AWSForm mobile={mobile} type={type} reset={() => this.handleSelectType(null)} createChannel={this.props.createChannel} />
      case "google":
        return <GoogleForm mobile={mobile} type={type} reset={() => this.handleSelectType(null)} createChannel={this.props.createChannel} />
      case "mqtt":
        return <MQTTForm mobile={mobile} type={type} reset={() => this.handleSelectType(null)} createChannel={this.props.createChannel} />
      case "http":
        return <HTTPForm mobile={mobile} type={type} reset={() => this.handleSelectType(null)} createChannel={this.props.createChannel} />
      case "azure":
        return <AzureHubForm mobile={mobile} type={type} reset={() => this.handleSelectType(null)} createChannel={this.props.createChannel} />
      case "iot_central":
        return <AzureCentralForm mobile={mobile} type={type} reset={() => this.handleSelectType(null)} createChannel={this.props.createChannel} />
      case "mydevices":
        return <MyDevicesForm mobile={mobile} type={type} reset={() => this.handleSelectType(null)} createChannel={this.props.createChannel} />
      case "adafruit":
        return <AdafruitForm mobile={mobile} type={type} reset={() => this.handleSelectType(null)} createChannel={this.props.createChannel} />
      case "ubidots":
        return <UbidotsForm mobile={mobile} type={type} reset={() => this.handleSelectType(null)} createChannel={this.props.createChannel} />
      case "datacake":
        return <DatacakeForm mobile={mobile} type={type} reset={() => this.handleSelectType(null)} createChannel={this.props.createChannel} />
      case "tago":
        return <TagoForm mobile={mobile} type={type} reset={() => this.handleSelectType(null)} createChannel={this.props.createChannel} />
      case "akenza":
        return <AkenzaForm mobile={mobile} type={type} reset={() => this.handleSelectType(null)} createChannel={this.props.createChannel} />
      case "googlesheet":
        return <GoogleSheetForm from="ChannelNew" mobile={mobile} type={type} reset={() => this.handleSelectType(null)} createChannel={this.props.createChannel} />
      case "microshare":
        return <MicroshareForm mobile={mobile} type={type} reset={() => this.handleSelectType(null)} createChannel={this.props.createChannel} />
      default:
        return <CargoForm mobile={mobile} type={type} reset={() => this.handleSelectType(null)} createChannel={this.props.createChannel} />
    }
  };

  render() {
    const { type } = this.state;

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
                  <Collapse
                    expandIconPosition="right"
                    defaultActiveKey={["1"]}
                    className="channel-new-panels-mobile"
                  >
                    <Panel header={<b>ADD A PREBUILT INTEGRATION</b>} key="1">
                      <ChannelPremadeRow
                        selectType={this.handleSelectType}
                        mobile
                      />
                    </Panel>
                  </Collapse>
                  <Collapse
                    expandIconPosition="right"
                    style={{ marginTop: 20 }}
                  >
                    <Panel
                      header={<b>ADD A CUSTOM INTEGRATION</b>}
                      key="1"
                      style={{ padding: 0 }}
                    >
                      <ChannelCreateRow
                        selectType={this.handleSelectType}
                        mobile
                      />
                    </Panel>
                  </Collapse>
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
                  <Card
                    size="small"
                    title="Add a Prebuilt Integration"
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
                      <ChannelPremadeRow selectType={this.handleSelectType} />
                    </div>
                  </Card>
                  <Card
                    size="small"
                    title="Add a Custom Integration"
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
                      <ChannelCreateRow selectType={this.handleSelectType} />
                    </div>
                  </Card>
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

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createChannel }, dispatch);
}

export default ChannelNew;
