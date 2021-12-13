import React, { useState } from "react";
import numeral from "numeral";
import UserCan from "../../common/UserCan";
import PaymentCard from "../../billing/PaymentCard";
import DownOutlined from "@ant-design/icons/DownOutlined";
import UpOutlined from "@ant-design/icons/UpOutlined";
import DataCreditPurchasesTable from "../../billing/DataCreditPurchasesTable";
import { SkeletonLayout } from '../../common/SkeletonLayout'
import IndexBlankSlate from "../../billing/IndexBlankSlate";
import { primaryBlue, tertiaryPurple } from "../../../util/colors";
import DCIMg from "../../../../img/datacredits.svg";
import BytesIMg from "../../../../img/datacredits-bytes-logo.svg";
import { Typography, Button, Card, Row, Col } from 'antd';
const { Text } = Typography

const MobileDataCreditsIndex = ({ loading, error, organization, paymentMethods, defaultPayment, triedFetchingPayments, user, styles }) => {
  const [showDCs, setShowDCs] = useState(true);
  const [showBytes, setShowBytes] = useState(true);
  const [showDefaultPayment, setShowDefaultPayment] = useState(true);

  const renderBlankSlate = () => {
    return (
      <div style={{ margin: 15 }}>
        <IndexBlankSlate organization={organization} onClick={() => {}} />
      </div>
    )
  }

  const renderContent = () => {
    return (
      <React.Fragment>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            overflowX: 'scroll',
            padding: "15px 15px 0px 15px",
          }}
          className="no-scroll-bar"
        >
          <UserCan noManager>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <Button
                type="primary"
                size="large"
                onClick={() => {}}
                style={{
                  borderRadius: 4,
                  marginRight: 8,
                  display: window.disable_user_burn !== "true" ? "inline" : "none"
                }}
              >
                Purchase DC
              </Button>
              <Button
                onClick={() => {}}
                size="large"
                style={{
                  borderRadius: 4,
                  display: !process.env.SELF_HOSTED ? "inline" : "none",
                }}
              >
                Automatic Renewals{" "}
                {organization.automatic_charge_amount ? "On" : "Off"}
              </Button>
            </div>
          </UserCan>
        </div>

        <div style={{ margin: 15 }}>
          <Card
            title="Remaining DC"
            bodyStyle={{ height: showDCs ? 90 : 0, padding: 0 }}
            extra={
              showDCs ? (
                <UpOutlined style={{ color: '#C8D6E4' }} onClick={() => setShowDCs(false)} />
              ) : (
                <DownOutlined style={{ color: '#C8D6E4' }} onClick={() => setShowDCs(true)} />
              )
            }
          >
            {
              showDCs && (
                <div style={{ overflowX: 'scroll', padding: 20 }} className="no-scroll-bar">
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: "center", minWidth: 300 }}>
                    <img style={styles.image} src={DCIMg} />
                    <Text style={{ ...styles.numberCount, color: primaryBlue }}>
                      {organization && numeral(organization.dc_balance).format("0,0")}
                    </Text>
                  </div>
                </div>
              )
            }
          </Card>
        </div>

        <div style={{ margin: 15 }}>
          <Card
            title="Remaining Bytes"
            bodyStyle={{ height: showBytes ? 90 : 0, padding: 0 }}
            extra={
              showBytes ? (
                <UpOutlined style={{ color: '#C8D6E4' }} onClick={() => setShowBytes(false)} />
              ) : (
                <DownOutlined style={{ color: '#C8D6E4' }} onClick={() => setShowBytes(true)} />
              )
            }
          >
            {
              showBytes && (
                <div style={{ overflowX: 'scroll', padding: 24 }} className="no-scroll-bar">
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: "center", minWidth: 300 }}>
                    <img style={styles.image} src={BytesIMg} />
                    <Text style={{ ...styles.numberCount, color: tertiaryPurple }}>
                      {organization && numeral(organization.dc_balance * 24).format("0,0")}
                    </Text>
                  </div>
                </div>
              )
            }
          </Card>
        </div>

        {!process.env.SELF_HOSTED && (
          <UserCan noManager>
            <div style={{ margin: 15 }}>
              <Card
                title="Default Payment Method"
                bodyStyle={{ height: showDefaultPayment ? 90 : 0, padding: 0 }}
                extra={
                  showDefaultPayment ? (
                    <UpOutlined style={{ color: '#C8D6E4' }} onClick={() => setShowDefaultPayment(false)} />
                  ) : (
                    <DownOutlined style={{ color: '#C8D6E4' }} onClick={() => setShowDefaultPayment(true)} />
                  )
                }
              >
                {
                  showDefaultPayment && (
                    <div style={{ overflowX: 'scroll', padding: 24 }} className="no-scroll-bar">
                    {paymentMethods.length > 0 && defaultPayment && (
                      <Row type="flex" style={{ alignItems: "center", minWidth: 200 }}>
                        <Col span={16}>
                          <PaymentCard
                            key={defaultPayment.id}
                            card={defaultPayment.card}
                          />
                        </Col>
                        <Col
                          span={8}
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "flex-end",
                            marginTop: -2,
                          }}
                        >
                          <p
                            style={{
                              fontFamily: "monospace",
                              color: "#777777",
                              display: "inline",
                              position: "relative",
                              top: 6,
                            }}
                          >
                            {defaultPayment.card.exp_month > 9
                              ? defaultPayment.card.exp_month
                              : "0" + defaultPayment.card.exp_month}
                            /{defaultPayment.card.exp_year.toString().slice(2)}
                          </p>
                        </Col>
                      </Row>
                    )}
                    {!defaultPayment && triedFetchingPayments && (
                      <Row type="flex" style={{ alignItems: "center" }}>
                        <Text style={styles.numberCount}>N/A</Text>
                      </Row>
                    )}
                    </div>
                  )
                }
              </Card>
            </div>
          </UserCan>
        )}
        <UserCan noManager>
          <div style={{ margin: 15 }}>
            <DataCreditPurchasesTable user={user} />
          </div>
        </UserCan>
      </React.Fragment>
    )
  }

  return (
    <div style={{ height: '100%', overflowY: 'hidden', backgroundColor: '#ffffff' }}>
      <div style={{ padding: 15, boxShadow: '0px 3px 7px 0px #ccc', backgroundColor: "#F5F7F9", height: 80, position: 'relative', zIndex: 10 }}>
        <Text style={{ fontSize: 32, fontWeight: 600 }}>Data Credits</Text>
      </div>
      <div style={{ height: 'calc(100% - 80px)', overflowY: 'scroll' }}>
        {
          loading && (
            <div style={{ marginTop: 15 }}>
              <SkeletonLayout />
            </div>
          )
        }
        {error && (
          <div style={{ margin: 15 }}>
            <Text>
              Data failed to load, please reload the page and try again
            </Text>
          </div>
        )}
        {
          organization && organization.dc_balance_nonce == 0 && (
            renderBlankSlate()
          )
        }
        {
          organization && organization.dc_balance_nonce != 0 && (
            renderContent()
          )
        }
      </div>
    </div>
  )
}

export default MobileDataCreditsIndex
