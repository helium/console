import React, { Component } from "react";
import { MobileDisplay, DesktopDisplay } from "../mobile/MediaQuery";
import { isMobile, minWidth } from "../../util/constants";
import find from 'lodash/find'
import { Link, useHistory } from 'react-router-dom';
import DashboardLayout from "../common/DashboardLayout";
import MobileLayout from "../mobile/MobileLayout";
import { COMMUNITY_INTEGRATION_TYPES } from "../../util/integrationInfo";
import ArrowLeftOutlined from "@ant-design/icons/ArrowLeftOutlined";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import { Button, Typography, Row, Col } from "antd";
const { Text } = Typography;

const ChannelNewCommunityIntro = (props) => {
  const history = useHistory();
  const { type } = props.match.params
  const integrationType = find(COMMUNITY_INTEGRATION_TYPES, { type })

  return (
    <>
      <MobileDisplay>
        <MobileLayout>
          <div>agsf</div>
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
                <Row>
                  <Col span={12}>
                    <Text style={{ fontSize: 22, fontWeight: 600, display: 'block' }}>{integrationType.info.title}</Text>
                    <Text style={{ display: 'block', marginTop: 30 }}>{integrationType.info.desc}</Text>
                    <div style={{ marginTop: 30 }}>
                      <Button
                        icon={<PlusOutlined />}
                        onClick={() => history.replace(`/integrations/new?type=${type}`)}
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
              </div>
            </div>
          </div>
        </DashboardLayout>
      </DesktopDisplay>
    </>
  )
}

export default ChannelNewCommunityIntro
