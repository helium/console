import React, { Component } from "react";
import moment from 'moment'
import withGql from "../../graphql/withGql";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import numeral from "numeral";
import find from "lodash/find";
import DashboardLayout, {SurveyNotificationContext} from "../common/DashboardLayout";
import MobileLayout from "../mobile/MobileLayout";
import MobileDataCreditsIndex from "../mobile/data_credits/MobileDataCreditsIndex";
import { MobileDisplay, DesktopDisplay } from "../mobile/MediaQuery";
import analyticsLogger from "../../util/analyticsLogger";
import DefaultPaymentModal from "./DefaultPaymentModal";
import PurchaseCreditModal from "./PurchaseCreditModal";
import AutomaticRenewalModal from "./AutomaticRenewalModal";
import OrganizationTransferDCModal from "./OrganizationTransferDCModal";
import RedeemSurveyTokenModal from "./RedeemSurveyTokenModal";
import DataCreditPurchasesTable from "./DataCreditPurchasesTable";
import IndexBlankSlate from "./IndexBlankSlate";
import PaymentCard from "./PaymentCard";
import { ORGANIZATION_SHOW_DC } from "../../graphql/organizations";
import { getPaymentMethods } from "../../actions/dataCredits";
import { Link } from "react-router-dom";
import { Typography, Card, Row, Col, Popover, Button } from "antd";
import WalletOutlined from "@ant-design/icons/WalletOutlined";
import SyncOutlined from "@ant-design/icons/SyncOutlined";
import RightCircleOutlined from "@ant-design/icons/RightCircleOutlined";
import DCIMg from "../../../img/datacredits.svg";
import BytesIMg from "../../../img/datacredits-bytes-logo.svg";
const { Text } = Typography;
import { primaryBlue, tertiaryPurple } from "../../util/colors";
import UserCan from "../common/UserCan";
import ErrorMessage from "../common/ErrorMessage";
import { isMobile } from "../../util/constants";

const styles = {
  tipText: {
    marginBottom: 0,
    color: primaryBlue,
  },
  image: {
    width: 33,
    marginRight: 8,
    top: -4,
    position: "relative",
  },
  numberCount: {
    fontSize: 40,
    marginTop: -8,
  },
};

class DataCreditsIndex extends Component {
  state = {
    showDefaultPaymentModal: false,
    showPurchaseCreditModal: false,
    showAutomaticRenewalModal: false,
    showOrganizationTransferDCModal: false,
    showRedeemSurveyTokenModal: false,
    paymentMethods: [],
    triedFetchingPayments: false,
  };

  componentDidMount() {
    analyticsLogger.logEvent(
      isMobile ? "ACTION_NAV_DATA_CREDITS_MOBILE" : "ACTION_NAV_DATA_CREDITS"
    );

    const { socket, currentOrganizationId } = this.props;

    this.channel = socket.channel("graphql:dc_index", {});
    this.channel.join();
    this.channel.on(
      `graphql:dc_index:${currentOrganizationId}:update_dc`,
      (message) => {
        this.props.orgShowDCQuery.refetch();
      }
    );

    if (
      this.props.orgShowDCQuery.organization &&
      this.props.orgShowDCQuery.organization.stripe_customer_id
    ) {
      this.fetchPaymentMethods();
    }
  }

  componentWillUnmount() {
    this.channel.leave();
  }

  componentDidUpdate(prevProps) {
    if (
      !prevProps.orgShowDCQuery.organization &&
      this.props.orgShowDCQuery.organization &&
      this.props.orgShowDCQuery.organization.stripe_customer_id
    ) {
      this.fetchPaymentMethods();
    }
  }

  fetchPaymentMethods = (callback, attempt = 0) => {
    if (process.env.SELF_HOSTED && !window.stripe_public_key) {
      return
    }

    if (attempt == 3) {
      return analyticsLogger.logEvent(
        isMobile
          ? "FAILED_TO_CREATE_DC_PURCHASE_AFTER_CC_PAYMENT_MOBILE"
          : "FAILED_TO_CREATE_DC_PURCHASE_AFTER_CC_PAYMENT",
        {
          organization_id: this.props.currentOrganizationId,
          step: "cannot get payment method info",
        }
      );
    }

    if (this.props.role === "admin") {
      this.props
        .getPaymentMethods()
        .then((paymentMethods) => {
          this.setState({ paymentMethods, triedFetchingPayments: true });
          if (callback) callback();
        })
        .catch((err) => {
          this.fetchPaymentMethods(callback, attempt + 1);
        });
    }
  };

  openModal = (modal) => {
    this.setState({ [modal]: true });
  };

  closeModal = (modal) => {
    this.setState({ [modal]: false });
  };

  renderBlankSlate = () => {
    const { organization } = this.props.orgShowDCQuery;
    return (
      <IndexBlankSlate
        organization={organization}
        onClick={() => this.openModal("showPurchaseCreditModal")}
      />
    );
  };

  renderContent = (context) => {
    const { organization } = this.props.orgShowDCQuery;
    const { dc_balance, default_payment_id } = organization;
    const defaultPayment = find(
      this.state.paymentMethods,
      (p) => p.id === organization.default_payment_id
    );

    return (
      <div>
        <Row gutter={16}>
          <Col span={8}>
            <Card
              title="Remaining Data Credits"
              bodyStyle={{ height: 90, padding: 0 }}
              extra={
                !process.env.SELF_HOSTED && organization && organization.received_free_dc &&
                !organization.survey_token_sent_at && moment(organization.inserted_at).add(30, "days").isAfter(moment()) ? (
                  <Link
                    to="#"
                    onClick={e => {
                      e.preventDefault()
                      context.toggleSurveyNotification()
                    }}
                  >
                    <Text style={styles.tipText}>Claim More</Text>
                  </Link>
                ) : (
                  <span />
                )
              }
            >
              <div
                style={{ overflowX: "scroll", padding: 24 }}
                className="no-scroll-bar"
              >
                <Row
                  type="flex"
                  style={{ alignItems: "center", minWidth: 300 }}
                >
                  <img style={styles.image} src={DCIMg} />
                  <Text style={{ ...styles.numberCount, color: primaryBlue }}>
                    {numeral(dc_balance).format("0,0")}
                  </Text>
                </Row>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card
              title="Remaining Bytes"
              extra={
                <Popover
                  content="Your quantity of Data Credits translates directly to number of bytes that can be transmitted by your devices."
                  placement="bottom"
                  overlayStyle={{ width: 220 }}
                >
                  <Link to="#" onClick={e => e.preventDefault()}>
                    <Text style={styles.tipText}>Learn More</Text>
                  </Link>
                </Popover>
              }
              bodyStyle={{ height: 90, padding: 0 }}
            >
              <div
                style={{ overflowX: "scroll", padding: 24 }}
                className="no-scroll-bar"
              >
                <Row
                  type="flex"
                  style={{ alignItems: "center", minWidth: 300 }}
                >
                  <img style={styles.image} src={BytesIMg} />
                  <Text
                    style={{ ...styles.numberCount, color: tertiaryPurple }}
                  >
                    {numeral(dc_balance * 24).format("0,0")}
                  </Text>
                </Row>
              </div>
            </Card>
          </Col>
          {(!process.env.SELF_HOSTED || window.stripe_public_key) && (
            <Col span={8}>
              <UserCan noManager>
                <Card
                  title="Default Payment Method"
                  extra={
                    <Link
                      to="#"
                      onClick={() =>
                        this.openModal("showDefaultPaymentModal")
                      }
                    >
                      <Text style={styles.tipText}>
                        {
                          this.state.paymentMethods.length > 0 ? "Change" : "Add Card"
                        }
                      </Text>
                    </Link>
                  }
                  bodyStyle={{ height: 90, padding: 0 }}
                >
                  <div
                    style={{ overflowX: "scroll", padding: 24 }}
                    className="no-scroll-bar"
                  >
                    {this.state.paymentMethods.length > 0 && defaultPayment && (
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
                    {!defaultPayment && this.state.triedFetchingPayments && (
                      <Row type="flex" style={{ alignItems: "center" }}>
                        <Text style={styles.numberCount}>N/A</Text>
                      </Row>
                    )}
                  </div>
                </Card>
              </UserCan>
            </Col>
          )}
        </Row>
        <UserCan noManager>
          <DataCreditPurchasesTable user={this.props.user} />
        </UserCan>
      </div>
    );
  };

  render() {
    const {
      showDefaultPaymentModal,
      showPurchaseCreditModal,
      showAutomaticRenewalModal,
      showOrganizationTransferDCModal,
      showRedeemSurveyTokenModal,
    } = this.state;
    const { organization, error, loading } = this.props.orgShowDCQuery;

    const defaultPayment = find(
      this.state.paymentMethods,
      (p) => p.id === organization.default_payment_id
    );

    return (
      <>
        <MobileDisplay>
          <MobileLayout>
            <MobileDataCreditsIndex
              organization={organization}
              paymentMethods={this.state.paymentMethods}
              fetchPaymentMethods={this.fetchPaymentMethods}
              defaultPayment={defaultPayment}
              triedFetchingPayments={this.state.triedFetchingPayments}
              styles={styles}
              user={this.props.user}
              loading={loading}
              error={error}
            />
          </MobileLayout>
        </MobileDisplay>

        <DesktopDisplay>
          <DashboardLayout
            title="Data Credits"
            user={this.props.user}
            noAddButton
          >
            <SurveyNotificationContext.Consumer>
            {
              context => (
                <>
                  <div
                    style={{
                      padding: "30px 30px 10px 30px",
                      height: "100%",
                      width: "100%",
                      backgroundColor: "#ffffff",
                      borderRadius: 6,
                      overflow: "hidden",
                      boxShadow: "0px 20px 20px -7px rgba(17, 24, 31, 0.19)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "flex-start",
                        padding: "0px 0px 20px 0px",
                        overflowX: "scroll",
                      }}
                      className="no-scroll-bar"
                    >
                      <UserCan noManager>
                        {organization && organization.dc_balance_nonce != 0 ? (
                          <React.Fragment>
                            {(!organization.received_free_dc ||
                              organization.dc_balance > 10000) && (
                              <Button
                                style={{ borderRadius: 4, marginRight: 20 }}
                                icon={<RightCircleOutlined />}
                                onClick={() =>
                                  this.openModal("showOrganizationTransferDCModal")
                                }
                              >
                                Transfer DC to Org
                              </Button>
                            )}
                            <Button
                              icon={<SyncOutlined />}
                              onClick={() =>
                                this.openModal("showAutomaticRenewalModal")
                              }
                              style={{
                                borderRadius: 4,
                                marginRight: 20,
                                display: !process.env.SELF_HOSTED || window.stripe_public_key ? "inline" : "none",
                              }}
                            >
                              Automatic Renewals{" "}
                              {organization.automatic_charge_amount ? "On" : "Off"}
                            </Button>
                            {
                              (!process.env.SELF_HOSTED || window.stripe_public_key || window.disable_user_burn !== 'true') && (
                                <Button
                                  type="primary"
                                  icon={<WalletOutlined />}
                                  onClick={() =>
                                    this.openModal("showPurchaseCreditModal")
                                  }
                                  style={{
                                    borderRadius: 4,
                                    marginRight: 20,
                                  }}
                                >
                                  Purchase Data Credits
                                </Button>
                              )
                            }
                            {
                              organization.survey_token_sent_at && !organization.survey_token_used && (
                                <Button
                                  type="primary"
                                  onClick={() => this.openModal("showRedeemSurveyTokenModal")}
                                  style={{
                                    borderRadius: 4,
                                  }}
                                >
                                  Redeem Free DC
                                </Button>
                              )
                            }
                          </React.Fragment>
                        ) : (
                          <div />
                        )}
                      </UserCan>
                    </div>
                    {error && <ErrorMessage />}
                    {organization &&
                      organization.dc_balance_nonce === 0 &&
                      this.renderBlankSlate()}
                    {organization &&
                      organization.dc_balance_nonce !== 0 &&
                      this.renderContent(context)}
                  </div>

                  <DefaultPaymentModal
                    open={showDefaultPaymentModal}
                    onClose={() => this.closeModal("showDefaultPaymentModal")}
                    organization={organization}
                    paymentMethods={this.state.paymentMethods}
                    fetchPaymentMethods={this.fetchPaymentMethods}
                  />

                  <PurchaseCreditModal
                    open={showPurchaseCreditModal}
                    onClose={() => this.closeModal("showPurchaseCreditModal")}
                    organization={organization}
                    fetchPaymentMethods={this.fetchPaymentMethods}
                    paymentMethods={this.state.paymentMethods}
                  />

                  <AutomaticRenewalModal
                    open={showAutomaticRenewalModal}
                    onClose={() => this.closeModal("showAutomaticRenewalModal")}
                    paymentMethods={this.state.paymentMethods}
                    organization={organization}
                  />

                  <OrganizationTransferDCModal
                    open={showOrganizationTransferDCModal}
                    onClose={() => this.closeModal("showOrganizationTransferDCModal")}
                    organization={organization}
                  />

                  <RedeemSurveyTokenModal
                    open={showRedeemSurveyTokenModal}
                    onClose={() => this.closeModal("showRedeemSurveyTokenModal")}
                  />
                </>
              )
            }
            </SurveyNotificationContext.Consumer>
          </DashboardLayout>
        </DesktopDisplay>
      </>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    currentOrganizationId: state.organization.currentOrganizationId,
    role: state.organization.currentRole,
    socket: state.apollo.socket,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ getPaymentMethods }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(
  withGql(DataCreditsIndex, ORGANIZATION_SHOW_DC, (props) => ({
    fetchPolicy: "cache-first",
    variables: { id: props.currentOrganizationId },
    name: "orgShowDCQuery",
  }))
);
