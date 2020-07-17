import React, { Component } from 'react'
import { graphql } from 'react-apollo';
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
import { ORGANIZATION_SHOW_DC, ORGANIZATION_UPDATE_SUBSCRIPTION } from '../../graphql/organizations'
import { getPaymentMethods } from '../../actions/dataCredits'
import { Link } from 'react-router-dom'
import { Icon, Typography, Card, Row, Col, Popover, Button } from 'antd';
import DCIMg from '../../../img/datacredits.svg'
import BytesIMg from '../../../img/datacredits-bytes-logo.svg'
import classNames from 'classnames';
const { Text, Title } = Typography
import { primaryBlue, tertiaryPurple } from '../../util/colors'
import UserCan from '../common/UserCan'

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

const queryOptions = {
  options: props => ({
    variables: {
      id: props.currentOrganizationId
    },
    fetchPolicy: 'cache-and-network',
  })
}

@connect(mapStateToProps, mapDispatchToProps)
@graphql(ORGANIZATION_SHOW_DC, queryOptions)
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

    const { subscribeToMore, variables, fetchMore } = this.props.data

    subscribeToMore({
      document: ORGANIZATION_UPDATE_SUBSCRIPTION,
      variables,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        fetchMore({
          updateQuery: (prev, { fetchMoreResult }) => fetchMoreResult
        })
      }
    })

    if (this.props.data.organization && this.props.data.organization.stripe_customer_id) {
      this.fetchPaymentMethods()
    }
  }

  componentDidUpdate(prevProps) {
    if(!prevProps.data.organization && this.props.data.organization && this.props.data.organization.stripe_customer_id) {
      this.fetchPaymentMethods()
    }
  }

  fetchPaymentMethods = (callback) => {
    if (this.props.role === "admin") {
      this.props.getPaymentMethods()
      .then(paymentMethods => {
        this.setState({ paymentMethods, triedFetchingPayments: true })
        if (callback) callback()
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
    const { organization } = this.props.data
    return (
      <div className="blankstateWrapper">
        <div className="message">
          <img style={{width: 100, marginBottom: 20}} src={DCIMg} />
          <h1>Data Credits</h1>
          {
            organization.dc_balance !== null && (
              <p style={{ fontWeight: 400 }}>For signing up with Console you've received an initial balance of 10000 Data Credits. You have {organization.dc_balance} remaining.</p>
            )
          }
          <p style={{ fontSize: 16 }}>Click here to purchase more Data Credits, set up an automatic renewal, and monitor balances.</p>
          <UserCan>
            <Button
              size="large"
              type="primary"
              icon="wallet"
              onClick={() => this.openModal("showPurchaseCreditModal")}
            >
              Purchase Data Credits
            </Button>
          </UserCan>

          <div className="explainer">
            <h2>What are Data Credits?</h2>
            <p>Data Credits are used by devices to send data via the Helium Network. The cost per fragment is $0.00001 USD (fragments are 24 bytes) which is equivalent to 1 Data Credit (DC). During the Beta, the cost to send packets is 0 DC.</p>
            <p>More details can be found <a href="https://developer.helium.com/longfi/data-credits" target="_blank"> here.</a></p>
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
            .blankstateWrapper {
              width: 100%;
              padding-top: 80px;
              margin: 0 auto;
              position: relative;
            }
          `}</style>
      </div>
    )
  }

  renderContent = () => {
    const { organization } = this.props.data
    const { dc_balance, default_payment_id } = organization
    const defaultPayment = find(this.state.paymentMethods, p => p.id === organization.default_payment_id)

    return (
      <div>
        <Row gutter={16}>
          <Col span={8}>
            <Card
              title="Remaining Data Credits"
              extra={
                <Popover
                  content="Data Credits - known as DCs - are used to pay all transaction fees on the Helium Network."
                  placement="bottom"
                  overlayStyle={{ width: 220 }}
                >
                  <Link to="#">
                    <Text style={styles.tipText}>What are Data Credits?</Text>
                  </Link>
                </Popover>
              }
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
          <Col span={8}>
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
                      <Text style={{ fontFamily: 'monospace', color: '#777777' }}>
                        {defaultPayment.card.exp_month > 9 ? defaultPayment.card.exp_month : "0" + defaultPayment.card.exp_month}/{defaultPayment.card.exp_year.toString().slice(2)}
                      </Text>
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
          </Col>
        </Row>
        <UserCan>
          <DataCreditPurchasesTable />
        </UserCan>
      </div>
    )
  }

  render

  render() {
    const { showDefaultPaymentModal, showPurchaseCreditModal, showAutomaticRenewalModal, showOrganizationTransferDCModal } = this.state
    const { organization, error } = this.props.data

    return (
      <DashboardLayout
        title="Data Credits"
        extra={
          <UserCan>
            {
              organization && organization.dc_balance_nonce != 0 ? (
                <React.Fragment>
                  <Button
                    size="large"
                    icon="right-circle"
                    onClick={() => this.openModal("showOrganizationTransferDCModal")}
                  >
                    Transfer DC to Org
                  </Button>
                  <Button
                    size="large"
                    icon="sync"
                    onClick={() => this.openModal("showAutomaticRenewalModal")}
                    style={{ marginLeft: 20 }}
                  >
                    Automatic Renewals {organization.automatic_charge_amount ? "On" : "Off"}
                  </Button>
                  <Button
                    size="large"
                    type="primary"
                    icon="wallet"
                    onClick={() => this.openModal("showPurchaseCreditModal")}
                    style={{ marginLeft: 20 }}
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
    role: state.organization.currentRole
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ getPaymentMethods }, dispatch)
}


export default DataCreditsIndex
