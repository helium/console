import React, { Component } from 'react'
import analyticsLogger from '../../util/analyticsLogger'
import { displayError } from '../../util/messages'
import { get } from '../../util/rest'
import stripe from '../../config/stripe'
import debounce from 'lodash/debounce'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom';
import QRCode from 'react-qr-code'
import numeral from 'numeral'
import find from 'lodash/find'
import { bindActionCreators } from 'redux'
import ExistingPaymentCards from './ExistingPaymentCards'
import BurnHNTPillbox from './BurnHNTPillbox'
import BurnManualEntry from './BurnManualEntry'
import { convertToTextShort } from './AmountEntryCalculator'
import StripeCardElement from './StripeCardElement'
import { setDefaultPaymentMethod, createCustomerIdAndCharge, createCharge, createDCPurchase, setAutomaticPayments, generateMemo } from '../../actions/dataCredits'
import { Modal, Button, Typography, Radio, Checkbox, Input, Icon, Spin } from 'antd';
const { Text } = Typography
const ROUTER_ADDRESS = "112qB3YaH5bZkCnKA5uRH7tBtGNv2Y5B4smv1jsmvGUzgKT71QpE"
const ROUTER_STAGING_ADDRESS = "1124CJ9yJaHq4D6ugyPCDnSBzQik61C1BqD9VMh1vsUmjwt16HNB"

const styles = {
  container: {
    backgroundColor: '#E6F7FF',
    padding: 24,
    borderRadius: 8,
  },
  costNumber: {
    color: '#4091F7',
    fontSize: 24,
    marginTop: -8
  },
  countBlueBox: {
    backgroundColor: '#E6F7FF',
    paddingLeft: 100,
    paddingRight: 100,
    paddingTop: 30,
    paddingBottom: 30,
    height: '100%',
    width: '100%',
    marginTop: 30
  },
  costContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#BAE7FF',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 15,
    paddingBottom: 10,
    marginTop: 15,
    borderRadius: 8
  }
}

@connect(null, mapDispatchToProps)
class PurchaseCreditModal extends Component {
  state = {
    showPage: "default",
    gettingPrice: false,
    countDC: undefined,
    countUSD: undefined,
    countB: undefined,
    loading: false,
    paymentIntentSecret: null,
    paymentMethodSelected: undefined,
    qrContent: null,
    hntToBurn: null,
    nextTimeStamp: null,
    manualQREntry: false,
  }

  componentDidMount() {
    const elements = stripe.elements()

    const style = {
      base: {
        color: "#32325d",
      }
    }
    this.card = elements.create("card", { style: style })

    this.card.on('focus', () => {
      this.setState({ paymentMethodSelected: undefined })
    })
  }

  componentDidUpdate(prevProps) {
    if(!prevProps.open && this.props.open) {
      analyticsLogger.logEvent("ACTION_OPEN_PURCHASE_DC_MODAL")
      if (this.state.countDC) {
        this.setState({ gettingPrice: true, hntToBurn: null })
        this.getOraclePrice()
      }
    }
  }

  getOraclePrice = debounce(() => {
    get('/api/data_credits/get_hnt_price')
    .then(({data}) => {
      const dcPrice = this.state.countDC * 0.00001
      const hntPrice = data.price / 100000000
      const hntToBurn = (Math.ceil((dcPrice / hntPrice) * 100000000) / 100000000).toFixed(8)

      const nextTimeStamp = data.next_price_timestamp * 1000

      this.setState({ gettingPrice: false, hntToBurn, nextTimeStamp })
    })
    .catch(() => {
      // failed to get price, do not allow burn to continue
      this.setState({ gettingPrice: false })
    })
  }, 500)

  handleCountInputUpdate = (e) => {
    if (e.target.value < 0) return
    if (e.target.value.length > 11) return
    // Refactor out conversion rates between USD, DC, Bytes later
    if (e.target.name == 'countDC') {
      this.setState({
        countDC: e.target.value,
        countUSD: e.target.value / 100000,
        countB: e.target.value * 24,
        gettingPrice: true
      })
      this.getOraclePrice()
    }
    if (e.target.value == '') {
      this.setState({
        countDC: undefined,
        countUSD: undefined,
        countB: undefined,
      })
    }
  }

  showCreditCard = async () => {
    analyticsLogger.logEvent("ACTION_OPEN_PURCHASE_DC_MODAL_CREDIT_CARD")

    const { organization, createCustomerIdAndCharge, createCharge } = this.props
    const defaultPayment = find(this.props.paymentMethods, p => p.id === organization.default_payment_id)
    const paymentMethodSelected = defaultPayment ? defaultPayment.id : undefined

    await this.setState({
      loading: true,
      countUSD: parseFloat(this.state.countUSD.toFixed(2)),
      countDC: parseInt(this.state.countUSD.toFixed(2) * 100000),
      countB: parseInt(this.state.countUSD.toFixed(2) * 100000),
    })

    if (organization.stripe_customer_id === null) {
      createCustomerIdAndCharge(this.state.countUSD)
      .then(({ payment_intent_secret }) => {
        this.setState({
          showPage: "creditcard",
          loading: false,
          paymentIntentSecret: payment_intent_secret,
          paymentMethodSelected
        }, () => this.card.mount("#card-element"))
      })
      .catch(err => {
        this.setState({ loading: false })
      })
    } else {
      createCharge(this.state.countUSD)
      .then(({ payment_intent_secret }) => {
        this.setState({
          showPage: "creditcard",
          loading: false,
          paymentIntentSecret: payment_intent_secret,
          paymentMethodSelected
        }, () => this.card.mount("#card-element"))
      })
      .catch(err => {
        this.setState({ loading: false })
      })
    }
  }

  showQRCode = () => {
    analyticsLogger.logEvent("ACTION_OPEN_PURCHASE_DC_MODAL_QR_CODE")
    this.props.generateMemo()
    .then(({ data }) => {
      const qr = {
        "type": "dc_burn",
        "address": process.env.ENV_DOMAIN == "console" ? ROUTER_ADDRESS : ROUTER_STAGING_ADDRESS,
        "amount": this.state.hntToBurn,
        "memo": data.memo
      }

      this.setState({ qrContent: JSON.stringify(qr), showPage: "qrCode", memo: data.memo })
    })
  }

  handleBack = () => {
    this.setState({ showPage: "default" })
  }

  handleSubmit = (e, card) => {
    e.preventDefault();
    this.setState({ loading: true })
    let payment

    if (this.state.paymentMethodSelected) {
      payment = {
        payment_method: this.state.paymentMethodSelected
      }
    } else {
      payment = {
        payment_method: {
          card: this.card,
          billing_details: {
            name: this.props.organization.name
          }
        },
        setup_future_usage: 'off_session'
      }
    }

    stripe.confirmCardPayment(this.state.paymentIntentSecret, payment)
    .then(result => {
      if (result.error) {
        displayError(result.error.message)
        this.setState({ loading: false })
      } else {
        if (result.paymentIntent.status === 'succeeded') {
          analyticsLogger.logEvent("ACTION_PURCHASE_DC_SUCCESS", { "paymentIntent": result.paymentIntent.id })

          this.props.fetchPaymentMethods(() => {
            const paymentMethod = find(this.props.paymentMethods, ["id", result.paymentIntent.payment_method])
            this.props.createDCPurchase(
              result.paymentIntent.amount,
              paymentMethod.card.brand,
              paymentMethod.card.last4,
              result.paymentIntent.id
            )
          })

          if (this.props.paymentMethods.length == 0) this.props.setDefaultPaymentMethod(result.paymentIntent.payment_method)

          this.setState({ loading: false, showPage: "default" })
          this.props.onClose()
        } else {
          this.setState({ loading: false })
          displayError("Could not process your payment, please try again.")
        }
      }
    })
  }

  onRadioChange = e => {
    this.card.clear()
    this.setState({ paymentMethodSelected: e.target.value })
  }

  handleClose = () => {
    setTimeout(() => this.handleBack(), 200)
    this.props.onClose()
  }

  toggleQREntry = () => {
    if (!this.state.manualQREntry) {
      analyticsLogger.logEvent("ACTION_OPEN_PURCHASE_DC_MODAL_MANUAL_ENTRY")
    }
    this.setState({ manualQREntry: !this.state.manualQREntry})
  }

  renderCountSelection = () => {
    const { countUSD, countB } = this.state
    return(
      <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Text>1 DC = 24 Byte Packet = $0.00001 USD</Text>
        <div style={styles.countBlueBox}>
          <div>
            <Input
              placeholder="Enter Quantity"
              name="countDC"
              value={this.state.countDC}
              onChange={this.handleCountInputUpdate}
              type="number"
              suffix={
                <span style={{ paddingRight: 10 }}><Text>DC</Text></span>
              }
              style={{ paddingLeft: 10, paddingRight: 10 }}
            />
          </div>
          {
            this.state.countUSD > 0 && (
              <div style={styles.costContainer}>
                <Text style={{ color: '#4091F7', marginTop: -5 }}>Cost:</Text>
                <Text style={styles.costNumber}>USD {countUSD && parseFloat(countUSD).toFixed(2)}</Text>
              </div>
            )
          }
          {
            this.state.gettingPrice && (
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
                <Spin indicator={<Icon type="loading" style={{ fontSize: 24 }} spin />} style={{ marginRight: 10 }}/>
                <Text style={{ color: '#40A9FF'}}>Calculating Cost...</Text>
              </div>
            )
          }
          {
            !this.state.gettingPrice && this.state.hntToBurn && (
              <BurnHNTPillbox hntToBurn={this.state.hntToBurn} nextTimeStamp={this.state.nextTimeStamp} memo={this.state.memo} />
            )
          }
        </div>
      </div>
    )
  }

  renderPayment = () => {
    const { paymentMethods } = this.props
    return (
      <React.Fragment>
        <div style={{
          ...styles.container,
          padding: 16,
          marginBottom: 24,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div><Text strong>{this.state.countDC}</Text></div>
            <div><Text>Data Credits</Text></div>
          </div>
          <Text style={styles.costNumber}>${this.state.countUSD || "0.00"}</Text>
        </div>

        {
          paymentMethods.length > 0 && (
            <ExistingPaymentCards
              paymentMethods={paymentMethods}
              paymentMethodSelected={this.state.paymentMethodSelected}
              onRadioChange={this.onRadioChange}
            />
          )
        }

        <div>
          <Text strong>
            {paymentMethods.length > 0 && "...or "}Add New Card
          </Text>
          {
            open && <StripeCardElement />
          }
        </div>
      </React.Fragment>
    )
  }

  renderQRCode = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: -30, }}>
        <div style={{ height: 30, width: '100%', paddingLeft: 50, paddingRight: 50, marginBottom: 60 }}>
          {this.state.hntToBurn && <BurnHNTPillbox hntToBurn={this.state.hntToBurn} nextTimeStamp={this.state.nextTimeStamp} />}
        </div>
        {this.state.qrContent && !this.state.manualQREntry && <QRCode value={this.state.qrContent} size={220}/>}
        {this.state.manualQREntry && <BurnManualEntry hntToBurn={this.state.hntToBurn} memo={this.state.memo} address={ROUTER_ADDRESS} />}
        <div style={{ marginTop: 20 }}>
          <Link to="#" onClick={this.toggleQREntry}>
            <Text style={{ textDecoration: 'underline', color: '#4091F7' }}>I {!this.state.manualQREntry && "don't"} want to use QR Code</Text>
          </Link>
        </div>
      </div>
    )
  }

  renderModalFooter = () => {
    if (this.state.showPage == "creditcard") return (
      [
        <Button key="back" onClick={this.handleBack} disabled={this.state.loading}>
          Back
        </Button>,
        <Button key="submit" type="primary" onClick={this.handleSubmit} disabled={this.state.loading}>
          Make Payment
        </Button>,
      ]
    )
    if (this.state.showPage == "qrCode") return (
      [
        <Button key="back" onClick={this.handleBack}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={this.handleClose}>
          Dismiss Transaction Details
        </Button>,
      ]
    )
    return (
      [
        <Button key="back" onClick={this.handleClose} disabled={this.state.loading}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={this.showCreditCard}
          disabled={!this.state.countUSD || this.state.countUSD == 0 || this.state.loading || this.state.gettingPrice}
        >
          Purchase with Credit Card
        </Button>,
        <Button
          key="submit2"
          type="primary"
          onClick={this.showQRCode}
          disabled={!this.state.countUSD || this.state.countUSD == 0 || this.state.gettingPrice}
        >
          Burn HNT to DC
        </Button>,
      ]
    )
  }

  render() {
    const { open } = this.props
    const { loading } = this.state
    let title = "How many Data Credits do you wish to purchase?"
    if (this.state.showPage == "creditcard") title = "Purchase DC with Credit Card"
    if (this.state.showPage == "qrCode" && !this.state.manualQREntry) title = "Use Helium App to Burn HNT using this QR"
    if (this.state.showPage == "qrCode" && this.state.manualQREntry) title = "Transaction Details for CLI"

    return (
      <Modal
        title={title}
        visible={open}
        onCancel={loading ? () => {} : this.handleClose}
        centered
        footer={this.renderModalFooter()}
        bodyStyle={{ padding: this.state.showPage == "default" && 0 }}
        width={560}
      >
        {this.state.showPage == "default" && this.renderCountSelection()}
        {this.state.showPage == "creditcard" && this.renderPayment()}
        {this.state.showPage == "qrCode" && this.renderQRCode()}
      </Modal>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createCustomerIdAndCharge, createCharge, setDefaultPaymentMethod, createDCPurchase, setAutomaticPayments, generateMemo }, dispatch)
}

export default PurchaseCreditModal
