import React, { Component } from "react";
import { MobileDisplay, DesktopDisplay } from "../mobile/MediaQuery";
import { isMobile, minWidth } from "../../util/constants";
import find from 'lodash/find'
import { Link, useHistory } from 'react-router-dom';
import DashboardLayout from "../common/DashboardLayout";
import MobileLayout from "../mobile/MobileLayout";
import { COMMUNITY_INTEGRATION_TYPES, getAllowedIntegrations } from "../../util/integrationInfo";
import ArrowLeftOutlined from "@ant-design/icons/ArrowLeftOutlined";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import { Button, Typography, Row, Col } from "antd";
const { Text } = Typography;

const ChannelNewCommunityIntro = (props) => {
  const history = useHistory();
  const { type } = props.match.params
  const allowedIntegrations = getAllowedIntegrations()
  const integrationType = find(COMMUNITY_INTEGRATION_TYPES.filter(i => allowedIntegrations[i.type]), { type })

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
                history.replace("/integrations/new");
              }}
            >
              Back to New Integrations
            </Button>
            <div>
              <Text style={{ fontSize: 27, fontWeight: 600 }}>
                {integrationType.name}
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
            <img style={{ height: 60, width: 60 }} src={integrationType.img} />
            <div style={{ marginTop: 5, marginBottom: 30 }}>
              <Text><a href={integrationType.info.externalLink} target="_blank">Developer Website</a></Text>
            </div>
            {renderRow(integrationType, history, true)}
          </div>
        </MobileLayout>
      </MobileDisplay>
      <DesktopDisplay>
        <DashboardLayout
          title={integrationType.name}
          user={props.user}
          noAddButton
          extra={<img style={{ height: 75, width: 75 }} src={integrationType.img} />}
          breadCrumbs={
            <div style={{ position: 'absolute', zIndex: 10 }}>
              <Link
                to="#"
                onClick={e => {
                  e.preventDefault()
                  history.replace("/integrations/new")
                }}
              >
                <Text strong><ArrowLeftOutlined style={{ fontSize: 12 }}/> Back to New Integrations</Text>
              </Link>
            </div>
          }
          underTitle={
            <div style={{ position: 'absolute', zIndex: 10, bottom: 20 }}>
              <Text><a href={integrationType.info.externalLink} target="_blank">Developer Website</a></Text>
            </div>
          }
        >
          <div
            style={{
              height: "100%",
              width: "100%",
              backgroundColor: "#ffffff",
              borderRadius: 6,
              overflow: "hidden",
              boxShadow: "0px 20px 20px -7px rgba(17, 24, 31, 0.19)",
            }}
          >
            <div style={{ overflowX: "scroll" }} className="no-scroll-bar">
              <div style={{ padding: "60px 30px 60px 30px", minWidth }}>
                {renderRow(integrationType, history)}
              </div>
            </div>
          </div>
        </DashboardLayout>
      </DesktopDisplay>
    </>
  )
}

const renderRow = (integrationType, history, mobile = false) => (
  <Row>
    <Col span={mobile ? 24 : 12}>
      <Text style={{ fontSize: mobile ? 22 : 28, fontWeight: 600, display: 'block' }}>{integrationType.info.title}</Text>
      <Text style={{ fontSize: 16, display: 'block', marginTop: 30 }}>{integrationType.info.desc}</Text>
      <div style={{ marginTop: 30 }}>
        <Button
          icon={<PlusOutlined />}
          onClick={() => history.replace(`/integrations/new?type=${integrationType.type}`)}
          type="primary"
          style={{ borderRadius: 4 }}
        >
          Add Integration
        </Button>
        <a href={integrationType.info.docLink} target="_blank">
          <Button
            style={{ borderRadius: 4, marginLeft: 16 }}
          >
            Documentation
          </Button>
        </a>
      </div>
    </Col>
  </Row>
)

export default ChannelNewCommunityIntro
