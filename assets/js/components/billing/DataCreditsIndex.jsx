import React, { Component } from 'react'
import { graphql } from 'react-apollo';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import find from 'lodash/find'
import DashboardLayout from '../common/DashboardLayout'
import analyticsLogger from '../../util/analyticsLogger'
import DefaultPaymentModal from './DefaultPaymentModal'
import PurchaseCreditModal from './PurchaseCreditModal'
import AutomaticRenewalModal from './AutomaticRenewalModal'
import PaymentCard from './PaymentCard'
import { ORGANIZATION_SHOW_DC } from '../../graphql/organizations'
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
    overflowY: 'scroll',
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
    paymentMethods: [],
  }

  componentDidMount() {
    analyticsLogger.logEvent("ACTION_NAV_DATA_CREDITS")
  }

  componentDidUpdate(prevProps) {
    if(!prevProps.data.organization && this.props.data.organization && this.props.data.organization.stripe_customer_id) {
      this.fetchPaymentMethods()
    }
  }

  fetchPaymentMethods = () => {
    this.props.getPaymentMethods()
    .then(paymentMethods => this.setState({ paymentMethods }))
  }

  openModal = (modal) => {
    this.setState({ [modal]: true })
  }

  closeModal = (modal) => {
    this.setState({ [modal]: false })
  }

  renderBlankState = () => {
    return (
      <div className="blankstateWrapper">
        <div className="message">
          <img style={{width: 100, marginBottom: 20}} src={DCIMg} />
          <h1>Data Credits</h1>
          <p>It doesn't look like you've used Data Credits yet.</p>
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
              background: #DFE8F4;
              padding: 20px 60px;
              border-radius: 20px;
              border: 1px solid #CCD7E9;
              text-align: center;
              margin-top: 50px;
              box-sizing: border-box;
            }

            .explainer h2 {
              color: #242425;
              font-size: 20px;
            }
            .explainer p {
              color: #556B8C;
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
            }
            p {
              font-size: 20px;
              font-weight: 300;
            }
            .blankstateWrapper {
              width: 100%;
              padding-top: 150px;
              margin: 0 auto;
              position: relative;
            }
          `}</style>
      </div>
    )
  }

  renderContent = () => {
    const { dc_balance, default_payment_id } = this.props.data.organization
    return (
      <div>
        <Row gutter={16}>
          <Col span={8}>
            <Card
              title="Total Data Credits"
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
              bodyStyle={styles.cardBody}
            >
              <Row type="flex" style={{ alignItems: 'center' }}>
                <img style={styles.image} src={DCIMg} />
                <Text style={{ ...styles.numberCount, color: primaryBlue }}>{dc_balance}</Text>
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
              bodyStyle={styles.cardBody}
            >
              <Row type="flex" style={{ alignItems: 'center' }}>
                <img style={styles.image} src={BytesIMg} />
                <Text style={{ ...styles.numberCount, color: tertiaryPurple }}>{dc_balance * 24}</Text>
                <Text>Approx {Math.floor(dc_balance * 24 / 1000)} MB</Text>
              </Row>
            </Card>
          </Col>
          <Col span={8}>
            <Card
              title="Default Payment Method"
              extra={
                <Link to="#" onClick={() => this.openModal("showDefaultPaymentModal")}>
                  <Text style={styles.tipText}>Change</Text>
                </Link>
              }
              bodyStyle={styles.cardBody}
            >
              {
                this.state.paymentMethods.length > 0 && (
                  <Row type="flex" style={{ alignItems: 'center' }}>
                    <PaymentCard
                      key={find(this.state.paymentMethods, p => p.id == default_payment_id).id}
                      card={find(this.state.paymentMethods, p => p.id == default_payment_id).card}
                      showExpire
                    />
                  </Row>
                )
              }
            </Card>
          </Col>
        </Row>
      </div>
    )
  }

  render

  render() {
    const { showDefaultPaymentModal, showPurchaseCreditModal, showAutomaticRenewalModal } = this.state
    const { organization, error } = this.props.data

    return (
      <DashboardLayout
        title="Data Credits"
        extra={
          <UserCan>
            {
              organization && organization.dc_balance != null ? (
                <React.Fragment>
                  <Button
                    size="large"
                    icon="sync"
                    onClick={() => this.openModal("showAutomaticRenewalModal")}
                  >
                    Automatic Renewals On
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
          organization && organization.dc_balance == null && this.renderBlankState()
        }
        {
          organization && organization.dc_balance != null && this.renderContent()
        }

        <DefaultPaymentModal
          open={showDefaultPaymentModal}
          onClose={() => this.closeModal("showDefaultPaymentModal")}
          paymentMethods={this.state.paymentMethods}
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
        />
      </DashboardLayout>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {
    currentOrganizationId: state.organization.currentOrganizationId,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ getPaymentMethods }, dispatch)
}


export default DataCreditsIndex
