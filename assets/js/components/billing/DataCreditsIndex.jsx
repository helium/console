import React, { Component } from 'react'
import withGql from '../../graphql/withGql'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import numeral from 'numeral'
import find from 'lodash/find'
import DashboardLayout from '../common/DashboardLayout'
import analyticsLogger from '../../util/analyticsLogger'
import DefaultPaymentModal from './DefaultPaymentModal'
import PurchaseCreditModal from './PurchaseCreditModal'
import AutomaticRenewalModal from './AutomaticRenewalModal'
import OrganizationTransferDCModal from './OrganizationTransferDCModal'
import DataCreditPurchasesTable from './DataCreditPurchasesTable'
import PaymentCard from './PaymentCard'
import { ORGANIZATION_SHOW_DC } from '../../graphql/organizations'
import { getPaymentMethods } from '../../actions/dataCredits'
import { Link } from 'react-router-dom'
import { Typography, Card, Row, Col, Popover, Button } from 'antd';
import { WalletOutlined, SyncOutlined, RightCircleOutlined } from '@ant-design/icons'
import DCIMg from '../../../img/datacredits.svg'
import BytesIMg from '../../../img/datacredits-bytes-logo.svg'
import classNames from 'classnames';
const { Text, Title } = Typography
import { primaryBlue, tertiaryPurple } from '../../util/colors'
import UserCan from '../common/UserCan'
import _JSXStyle from "styled-jsx/style"

const styles = {
  tipText: {
    marginBottom: 0,
    color: primaryBlue,
  },
  image: {
    width: 33,
    marginRight: 8,
  },
  numberCount: {
    fontSize: 40,
    marginTop: -8,
  },
  cardBody: {
    height: 90,
    overflowY: 'hidden',
    overflowX: 'scroll',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  }
}

class DataCreditsIndex extends Component {
  state = {
    showDefaultPaymentModal: false,
    showPurchaseCreditModal: false,
    showAutomaticRenewalModal: false,
    showOrganizationTransferDCModal: false,
    paymentMethods: [],
    triedFetchingPayments: false,
  }

  componentDidMount() {
    analyticsLogger.logEvent("ACTION_NAV_DATA_CREDITS")

    const { socket, currentOrganizationId } = this.props

    this.channel = socket.channel("graphql:dc_index", {})
    this.channel.join()
    this.channel.on(`graphql:dc_index:${currentOrganizationId}:update_dc`, (message) => {
      this.props.orgShowDCQuery.refetch()
    })

    if (this.props.orgShowDCQuery.organization && this.props.orgShowDCQuery.organization.stripe_customer_id) {
      this.fetchPaymentMethods()
    }
  }

  componentWillUnmount() {
    this.channel.leave()
  }

  componentDidUpdate(prevProps) {
    if(!prevProps.orgShowDCQuery.organization && this.props.orgShowDCQuery.organization && this.props.orgShowDCQuery.organization.stripe_customer_id) {
      this.fetchPaymentMethods()
    }
  }

  fetchPaymentMethods = (callback, attempt = 0) => {
    if (attempt == 3) {
      return analyticsLogger.logEvent("FAILED_TO_CREATE_DC_PURCHASE_AFTER_CC_PAYMENT", { "organization_id": this.props.currentOrganizationId, "step": "cannot get payment method info" })
    }

    if (this.props.role === "admin") {
      this.props.getPaymentMethods()
      .then(paymentMethods => {
        this.setState({ paymentMethods, triedFetchingPayments: true })
        if (callback) callback()
      })
      .catch(err => {
        this.fetchPaymentMethods(callback, attempt + 1)
      })
    }
  }

  openModal = (modal) => {
    this.setState({ [modal]: true })
  }

  closeModal = (modal) => {
    this.setState({ [modal]: false })
  }

  renderBlankState = () => {
    const { organization } = this.props.orgShowDCQuery
    return (
      <div className="blankstateWrapper" style={{ paddingTop: "80px" }}>
        <div className="message">
          <img style={{width: 100, marginBottom: 20}} src={DCIMg} />
          <h1>Data Credits</h1>
          {
            organization.dc_balance !== null && (
              <p style={{ fontWeight: 400 }}>For signing up with Console you've received an initial balance of 10000 Data Credits. You have {organization.dc_balance} remaining.</p>
            )
          }
          <UserCan noManager>
            <p style={{ fontSize: 16 }}>Click here to purchase more Data Credits, set up an automatic renewal, and monitor balances.</p>
          </UserCan>
          <UserCan noManager>
            <Button
              size="large"
              type="primary"
              icon={<WalletOutlined />}
              onClick={() => this.openModal("showPurchaseCreditModal")}
              style={{ borderRadius: 4 }}
            >
              Purchase Data Credits
            </Button>
          </UserCan>

          <div className="explainer">
            <h2>What are Data Credits?</h2>
            <p>Data Credits are used by devices to send data via the Helium Network. The cost per fragment is $0.00001 USD (fragments are 24 bytes) which is equivalent to 1 Data Credit (DC).</p>
            <p>More details can be found <a href="https://docs.helium.com/use-the-network/console/data-credits" target="_blank"> here.</a></p>
          </div>
        </div>
        <style jsx>{`
           .message {
              width: 100%;
              max-width: 600px;
              margin: 0 auto;
              text-align: center;
            }
            .explainer {
              padding: 20px 60px;
              border-radius: 20px;
              text-align: center;
              margin-top: 50px;
              box-sizing: border-box;
  border: none;
  background: #F6F8FA;
            }

            .explainer h2 {
              color: #242424;
              font-size: 20px;
            }
            .explainer p {
              color: #565656;
              font-size: 15px;
            }

            .explainer p a {
              color: #096DD9;
            }

            h1, p  {

              color: #242425;
            }
            h1 {
              font-size: 46px;
              margin-bottom: 10px;
              font-weight: 600;
              margin-bottom: 10px;
            }
            p {
              font-size: 20px;
              font-weight: 300;
              margin: 0 auto;
              max-width: 500px;
              margin-bottom: 20px;
            }
          `}</style>
      </div>
    )
  }

  renderContent = () => {
    const { organization } = this.props.orgShowDCQuery
    const { dc_balance, default_payment_id } = organization
    const defaultPayment = find(this.state.paymentMethods, p => p.id === organization.default_payment_id)

    return (
      <div>
        <p className="page-description" style={{ maxWidth: "450px" }}>
          Data Credits (also known as DCs) are used to pay all transaction fees on the Helium Network. <a href="https://docs.helium.com/use-the-network/console/data-credits" target="_blank"> Tell me more about Data Credits.</a>
        </p>
        <Row gutter={16}>
          <Col span={8}>
            <Card
              title="Remaining Data Credits"
              bodyStyle={{ ...styles.cardBody, minWidth: 300 }}
              style={{ overflow: 'hidden' }}
            >
              <Row type="flex" style={{ alignItems: 'center' }}>
                <img style={styles.image} src={DCIMg} />
                <Text style={{ ...styles.numberCount, color: primaryBlue }}>{numeral(dc_balance).format('0,0')}</Text>
              </Row>
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
                  <Link to="#">
                    <Text style={styles.tipText}>Learn More</Text>
                  </Link>
                </Popover>
              }
              style={{ overflow: 'hidden' }}
              bodyStyle={{ ...styles.cardBody, minWidth: 300 }}
            >
              <img style={styles.image} src={BytesIMg} />
              <Text style={{ ...styles.numberCount, color: tertiaryPurple }}>{numeral(dc_balance * 24).format('0,0')}</Text>
              {false && <Text>Approx {Math.floor(dc_balance * 24 / 1000)} MB</Text>}
            </Card>
          </Col>
          {!process.env.SELF_HOSTED && (
            <Col span={8}>
              <UserCan noManager>
                <Card
                  title="Default Payment Method"
                  extra={
                    this.state.paymentMethods.length > 0 && (
                      <Link to="#" onClick={() => this.openModal("showDefaultPaymentModal")}>
                        <Text style={styles.tipText}>Change</Text>
                      </Link>
                    )
                  }
                  bodyStyle={{ ...styles.cardBody, minWidth: 230 }}
                  style={{ overflow: 'hidden' }}
                >
                  {
                    this.state.paymentMethods.length > 0 && defaultPayment && (
                      <Row type="flex" style={{ alignItems: 'center', width: '100%' }}>
                        <Col span={16}>
                          <PaymentCard
                            key={defaultPayment.id}
                            card={defaultPayment.card}
                          />
                        </Col>
                        <Col span={8} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', marginTop: -2 }}>
                          <p style={{ fontFamily: 'monospace', color: '#777777', display: 'inline', position: 'relative', top: 6 }}>
                            {defaultPayment.card.exp_month > 9 ? defaultPayment.card.exp_month : "0" + defaultPayment.card.exp_month}/{defaultPayment.card.exp_year.toString().slice(2)}
                          </p>
                        </Col>
                      </Row>
                    )
                  }
                  {
                    (!defaultPayment && this.state.triedFetchingPayments) &&
                    (
                      <Row type="flex" style={{ alignItems: 'center' }}>
                        <Text style={styles.numberCount}>N/A</Text>
                      </Row>
                    )
                  }
                </Card>
              </UserCan>
            </Col>
          )}
        </Row>
        <UserCan noManager>
          <DataCreditPurchasesTable user={this.props.user}/>
        </UserCan>
      </div>
    )
  }

  render() {
    const { showDefaultPaymentModal, showPurchaseCreditModal, showAutomaticRenewalModal, showOrganizationTransferDCModal } = this.state
    const { organization, error } = this.props.orgShowDCQuery

    const defaultPayment = find(this.state.paymentMethods, p => p.id === organization.default_payment_id)

    return (
      <DashboardLayout
        title="Data Credits"
        user={this.props.user}
        extra={
          <UserCan noManager>
            {
              organization && organization.dc_balance_nonce != 0 ? (
                <React.Fragment>
                  {
                    (!organization.received_free_dc || organization.dc_balance > 10000) && (
                      <Button
                        size="large"
                        style={{ borderRadius: 4 }}
                        icon={<RightCircleOutlined />}
                        onClick={() => this.openModal("showOrganizationTransferDCModal")}
                      >
                        Transfer DC to Org
                      </Button>
                    )
                  }
                  {
                    defaultPayment && (
                      <Button
                        size="large"
                        icon={<SyncOutlined />}
                        onClick={() => this.openModal("showAutomaticRenewalModal")}
                        style={{ borderRadius: 4, marginLeft: 20, display: !process.env.SELF_HOSTED ? "inline" : "none" }}
                      >
                        Automatic Renewals {organization.automatic_charge_amount ? "On" : "Off"}
                      </Button>
                    )
                  }
                  <Button
                    size="large"
                    type="primary"
                    icon={<WalletOutlined />}
                    onClick={() => this.openModal("showPurchaseCreditModal")}
                    style={{ marginLeft: 20, borderRadius: 4 }}
                  >
                    Purchase Data Credits
                  </Button>
                </React.Fragment>
              ) : (
                <div />
              )
            }
          </UserCan>
        }
      >
        {
          error && <Text>Data failed to load, please reload the page and try again</Text>
        }
        {
          organization && organization.dc_balance_nonce == 0 && this.renderBlankState()
        }
        {
          organization && organization.dc_balance_nonce != 0 && this.renderContent()
        }

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
      </DashboardLayout>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {
    currentOrganizationId: state.organization.currentOrganizationId,
    role: state.organization.currentRole,
    socket: state.apollo.socket,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ getPaymentMethods }, dispatch)
}


export default connect(mapStateToProps, mapDispatchToProps)(
  withGql(DataCreditsIndex, ORGANIZATION_SHOW_DC, props => ({ fetchPolicy: 'cache-first', variables: { id: props.currentOrganizationId }, name: 'orgShowDCQuery' }))
)
