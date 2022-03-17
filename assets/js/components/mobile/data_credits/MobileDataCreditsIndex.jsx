import React, { useState } from "react";
import numeral from "numeral";
import { PopupButton } from '@typeform/embed-react'
import { submittedOrganizationSurvey } from "../../../actions/organization";
import UserCan from "../../common/UserCan";
import PaymentCard from "../../billing/PaymentCard";
import DataCreditPurchasesTable from "../../billing/DataCreditPurchasesTable";
import PurchaseCreditModal from "../../billing/PurchaseCreditModal";
import OrganizationTransferDCModal from "../../billing/OrganizationTransferDCModal";
import AutomaticRenewalModal from "../../billing/AutomaticRenewalModal";
import { SkeletonLayout } from "../../common/SkeletonLayout";
import IndexBlankSlate from "../../billing/IndexBlankSlate";
import { primaryBlue, tertiaryPurple } from "../../../util/colors";
import DCIMg from "../../../../img/datacredits.svg";
import BytesIMg from "../../../../img/datacredits-bytes-logo.svg";
import { Typography, Button, Row, Col, Collapse } from "antd";
import ErrorMessage from "../../common/ErrorMessage";
const { Text } = Typography;
const { Panel } = Collapse;

const MobileDataCreditsIndex = ({
  loading,
  error,
  organization,
  fetchPaymentMethods,
  paymentMethods,
  defaultPayment,
  triedFetchingPayments,
  user,
  styles,
}) => {
  const [showPurchaseCreditModal, setShowPurchaseCreditModal] = useState(false);
  const [showAutomaticRenewalModal, setShowAutomaticRenewalModal] =
    useState(false);
  const [showOrganizationTransferDCModal, setShowOrganizationTransferDCModal] =
    useState(false);

  const renderBlankSlate = () => {
    return (
      <div style={{ margin: 15 }}>
        <IndexBlankSlate
          organization={organization}
          onClick={() => setShowPurchaseCreditModal(true)}
        />
      </div>
    );
  };

  const renderContent = () => {
    return (
      <React.Fragment>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            overflowX: "scroll",
            padding: "15px 15px 0px 15px",
          }}
          className="no-scroll-bar"
        >
          <UserCan noManager>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <Button
                type="primary"
                size="large"
                onClick={() => setShowPurchaseCreditModal(true)}
                style={{
                  borderRadius: 4,
                  marginRight: 8,
                  display:
                    window.disable_user_burn !== "true" ? "inline" : "none",
                }}
              >
                Purchase DC
              </Button>
              {
                organization.received_free_dc && !organization.survey_token && (
                  <PopupButton
                    id="j9LV2ScD"
                    style={{
                      display: !process.env.SELF_HOSTED ? "inline" : "none",
                      marginRight: 8,
                    }}
                    className="launch-survey-button"
                    onSubmit={() => {
                      setTimeout(submittedOrganizationSurvey, 4000)
                    }}
                  >
                    Get More DC
                  </PopupButton>
                )
              }
              <Button
                onClick={() => setShowAutomaticRenewalModal(true)}
                size="large"
                style={{
                  borderRadius: 4,
                  marginRight: 8,
                  display: !process.env.SELF_HOSTED ? "inline" : "none",
                }}
              >
                Automatic Renewals{" "}
                {organization.automatic_charge_amount ? "On" : "Off"}
              </Button>
              {(!organization.received_free_dc ||
                organization.dc_balance > 10000) && (
                <Button
                  style={{ borderRadius: 4 }}
                  size="large"
                  onClick={() => setShowOrganizationTransferDCModal(true)}
                >
                  Transfer DC to Org
                </Button>
              )}
            </div>
          </UserCan>
        </div>

        <div style={{ margin: 15 }}>
          <Collapse expandIconPosition="right" defaultActiveKey="1">
            <Panel header={<b>REMAINING DATA CREDITS</b>} key="1">
              <div
                style={{ overflowX: "scroll", padding: 10 }}
                className="no-scroll-bar"
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    minWidth: 300,
                  }}
                >
                  <img style={styles.image} src={DCIMg} />
                  <Text style={{ ...styles.numberCount, color: primaryBlue }}>
                    {organization &&
                      numeral(organization.dc_balance).format("0,0")}
                  </Text>
                </div>
              </div>
            </Panel>
          </Collapse>
        </div>

        <div style={{ margin: 15 }}>
          <Collapse expandIconPosition="right" defaultActiveKey="1">
            <Panel header={<b>REMAINING PACKETS</b>} key="1">
              <div
                style={{ overflowX: "scroll", padding: 14 }}
                className="no-scroll-bar"
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    minWidth: 300,
                  }}
                >
                  <img style={styles.image} src={BytesIMg} />
                  <Text
                    style={{ ...styles.numberCount, color: tertiaryPurple }}
                  >
                    {organization &&
                      numeral(organization.dc_balance * 24).format("0,0")}
                  </Text>
                </div>
              </div>
            </Panel>
          </Collapse>
        </div>

        {!process.env.SELF_HOSTED && (
          <UserCan noManager>
            <div style={{ margin: 15 }}>
              <Collapse expandIconPosition="right" defaultActiveKey="1">
                <Panel header={<b>DEFAULT PAYMENT METHOD</b>} key="1">
                  <div
                    style={{ overflowX: "scroll", padding: 10 }}
                    className="no-scroll-bar"
                  >
                    {paymentMethods.length > 0 && defaultPayment && (
                      <Row
                        type="flex"
                        style={{ alignItems: "center", minWidth: 200 }}
                      >
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
                </Panel>
              </Collapse>
            </div>
          </UserCan>
        )}
        <UserCan noManager>
          <div style={{ margin: 15 }}>
            <DataCreditPurchasesTable user={user} mobile={true} />
          </div>
        </UserCan>
      </React.Fragment>
    );
  };

  return (
    <div
      style={{
        height: "100%",
        overflowY: "hidden",
        backgroundColor: "#ffffff",
      }}
    >
      <div
        style={{
          padding: 15,
          boxShadow: "0px 3px 7px 0px #ccc",
          backgroundColor: "#F5F7F9",
          height: 80,
          position: "relative",
          zIndex: 10,
        }}
      >
        <Text style={{ fontSize: 32, fontWeight: 600 }}>Data Credits</Text>
      </div>
      <div style={{ height: "calc(100% - 80px)", overflowY: "scroll" }}>
        {loading && (
          <div style={{ marginTop: 15 }}>
            <SkeletonLayout />
          </div>
        )}
        {error && <ErrorMessage />}
        {organization &&
          organization.dc_balance_nonce == 0 &&
          renderBlankSlate()}
        {organization && organization.dc_balance_nonce != 0 && renderContent()}
      </div>

      <PurchaseCreditModal
        open={showPurchaseCreditModal}
        onClose={() => setShowPurchaseCreditModal(false)}
        organization={organization}
        fetchPaymentMethods={fetchPaymentMethods}
        paymentMethods={paymentMethods}
        mobile={true}
      />

      <AutomaticRenewalModal
        open={showAutomaticRenewalModal}
        onClose={() => setShowAutomaticRenewalModal(false)}
        paymentMethods={paymentMethods}
        organization={organization}
        mobile={true}
      />

      <OrganizationTransferDCModal
        open={showOrganizationTransferDCModal}
        onClose={() => setShowOrganizationTransferDCModal(false)}
        organization={organization}
        mobile={true}
      />
    </div>
  );
};

export default MobileDataCreditsIndex;
