import React, { Component } from "react";
import analyticsLogger from "../../util/analyticsLogger";
import { displayError } from "../../util/messages";
import { get } from "../../util/rest";
import stripe from "../../config/stripe";
import debounce from "lodash/debounce";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import QRCode from "react-qr-code";
import find from "lodash/find";
import { bindActionCreators } from "redux";
import ExistingPaymentCards from "./ExistingPaymentCards";
import BurnHNTPillbox from "./BurnHNTPillbox";
import BurnManualEntry from "./BurnManualEntry";
import StripeCardElement from "./StripeCardElement";
import {
  setDefaultPaymentMethod,
  createCustomerIdAndCharge,
  createCharge,
  createDCPurchase,
  setAutomaticPayments,
  generateMemo,
  redeemTransaction,
  getRouterAddress,
} from "../../actions/dataCredits";
import { Modal, Button, Typography, Input, Popover } from "antd";
import InfoCircleOutlined from "@ant-design/icons/InfoCircleOutlined";
const { Text } = Typography;

const styles = {
  container: {
    backgroundColor: "#E6F7FF",
    padding: 24,
    borderRadius: 8,
  },
  costNumber: {
    color: "#4091F7",
    fontSize: 24,
    marginTop: -8,
  },
  countBlueBox: {
    backgroundColor: "#E6F7FF",
    paddingLeft: 100,
    paddingRight: 100,
    paddingTop: 30,
    paddingBottom: 30,
    height: "100%",
    width: "100%",
    marginTop: 30,
  },
  countBlueBoxMobile: {
    backgroundColor: "#E6F7FF",
    paddingLeft: 40,
    paddingRight: 40,
    paddingTop: 30,
    paddingBottom: 30,
    height: "100%",
    width: "100%",
    marginTop: 20,
  },
  costContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#BAE7FF",
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 15,
    paddingBottom: 10,
    marginTop: 15,
    borderRadius: 8,
  },
};

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
    routerAddress: "",
    description: null,
    transactionId: ""
  };

  componentDidMount() {
    if (!process.env.SELF_HOSTED || window.stripe_public_key) {
      const elements = stripe.elements();

      const style = {
        base: {
          color: "#32325d",
        },
      };
      this.card = elements.create("card", { style: style });

      this.card.on("focus", () => {
        this.setState({ paymentMethodSelected: undefined });
      });
    }

    this.props.getRouterAddress().then(({ data }) => {
      if (typeof data.address === "string") {
        this.setState({ routerAddress: data.address });
      }
    });
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.open && this.props.open) {
      analyticsLogger.logEvent("ACTION_OPEN_PURCHASE_DC_MODAL");
    }

    if (prevProps.open && !this.props.open) {
      this.card && this.card.unmount();
    }
  }

  getOraclePrice = debounce(() => {
    get("/api/data_credits/get_hnt_price")
      .then(({ data }) => {
        const dcPrice = this.state.countDC * 0.00001;
        const hntPrice = data.price / 100000000;
        const hntToBurn = (
          Math.ceil((dcPrice / hntPrice) * 100000000) / 100000000
        ).toFixed(8);

        const nextTimeStamp = data.next_price_timestamp * 1000;

        this.setState({ gettingPrice: false, hntToBurn, nextTimeStamp });
      })
      .catch(() => {
        // failed to get price, do not allow burn to continue
        this.setState({ gettingPrice: false });
      });
  }, 500);

  handleCountInputUpdate = (e) => {
    if (e.target.value < 0) return;
    if (e.target.value.length > 11) return;
    // Refactor out conversion rates between USD, DC, Bytes later
    if (e.target.name == "countDC") {
      const costMultiplier = window.dc_cost_multiplier || 1;
      this.setState({
        countDC: e.target.value,
        countUSD: (e.target.value / 100000) * costMultiplier,
        countB: e.target.value * 24,
      });
    }
    if (e.target.value == "") {
      this.setState({
        countDC: undefined,
        countUSD: undefined,
        countB: undefined,
      });
    }
  };

  handleTransactionIdUpdate = (e) => {
    this.setState({
      transactionId: e.target.value
    })
  };

  showCreditCard = async () => {
    analyticsLogger.logEvent("ACTION_OPEN_PURCHASE_DC_MODAL_CREDIT_CARD");

    const { organization, createCustomerIdAndCharge, createCharge } =
      this.props;
    const defaultPayment = find(
      this.props.paymentMethods,
      (p) => p.id === organization.default_payment_id
    );
    const paymentMethodSelected = defaultPayment
      ? defaultPayment.id
      : undefined;

    const costMultiplier = window.dc_cost_multiplier || 1;
    await this.setState({
      loading: true,
      countUSD: parseFloat(this.state.countUSD.toFixed(2)),
      countDC: parseInt(
        (this.state.countUSD.toFixed(2) * 100000) / costMultiplier
      ),
      countB: parseInt(
        (this.state.countUSD.toFixed(2) * 100000 * 24) / costMultiplier
      ),
    });

    if (organization.stripe_customer_id === null) {
      createCustomerIdAndCharge(this.state.countUSD, this.state.description)
        .then(({ payment_intent_secret }) => {
          this.setState(
            {
              showPage: "creditcard",
              loading: false,
              paymentIntentSecret: payment_intent_secret,
              paymentMethodSelected,
            },
            () => this.card.mount("#card-element-purchase-flow")
          );
        })
        .catch((err) => {
          this.setState({ loading: false });
        });
    } else {
      createCharge(this.state.countUSD, this.state.description)
        .then(({ payment_intent_secret }) => {
          this.setState(
            {
              showPage: "creditcard",
              loading: false,
              paymentIntentSecret: payment_intent_secret,
              paymentMethodSelected,
            },
            () => this.card.mount("#card-element-purchase-flow")
          );
        })
        .catch((err) => {
          this.setState({ loading: false });
        });
    }
  };

  showRedeemTransaction = () => {
    this.setState({
      showPage: "redeemTransaction",
      memo: null,
    });
  };

  showDCPortal = () => {
    analyticsLogger.logEvent("ACTION_OPEN_PURCHASE_DC_MODAL_QR_CODE");

    this.props.generateMemo().then(({ data }) => {
      this.setState({
        showPage: "dcPortal",
        memo: data.memo,
      });
    });
  };

  showQRCode = () => {
    analyticsLogger.logEvent("ACTION_OPEN_PURCHASE_DC_MODAL_QR_CODE");

    this.props.generateMemo().then(({ data }) => {
      const qr = {
        address: "112qB3YaH5bZkCnKA5uRH7tBtGNv2Y5B4smv1jsmvGUzgKT71QpE",
        mint: "iotEVVZLEywoTn1QdwNPddxPWszn3zFhEot3MfL9fns",
        memo: data.memo,
        type: "dc_delegate"
      };

      this.setState({
        qrContent: JSON.stringify(qr),
        showPage: "qrCode",
        memo: data.memo,
      });
    });
  };

  handleBack = () => {
    this.setState({ showPage: "default" });
  };

  handleRedeemTransaction = (transactionId) => {
    this.props.redeemTransaction(transactionId)
  }

  handleSubmit = (e, card) => {
    e.preventDefault();
    this.setState({ loading: true });
    let payment;

    if (this.state.paymentMethodSelected) {
      payment = {
        payment_method: this.state.paymentMethodSelected,
      };
    } else {
      payment = {
        payment_method: {
          card: this.card,
          billing_details: {
            name: this.props.organization.name,
          },
        },
        setup_future_usage: "off_session",
      };
    }

    stripe
      .confirmCardPayment(this.state.paymentIntentSecret, payment)
      .then((result) => {
        if (result.error) {
          displayError(result.error.message);
          this.setState({ loading: false });
        } else {
          if (result.paymentIntent.status === "succeeded") {
            analyticsLogger.logEvent("ACTION_PURCHASE_DC_SUCCESS", {
              paymentIntent: result.paymentIntent.id,
            });

            this.props.fetchPaymentMethods(() => {
              const paymentMethod = find(this.props.paymentMethods, [
                "id",
                result.paymentIntent.payment_method,
              ]);
              this.createDCPurchaseAfterSuccess(result, paymentMethod);
            });

            if (this.props.paymentMethods.length == 0)
              this.props.setDefaultPaymentMethod(
                result.paymentIntent.payment_method
              );

            this.setState({ loading: false, showPage: "default" });
            this.props.onClose();
          } else {
            this.setState({ loading: false });
            displayError("Could not process your payment, please try again.");
          }
        }
      });
  };

  createDCPurchaseAfterSuccess = (result, paymentMethod, attempt = 0) => {
    if (attempt === 3) {
      return analyticsLogger.logEvent(
        "FAILED_TO_CREATE_DC_PURCHASE_AFTER_CC_PAYMENT",
        { id: result.paymentIntent.id, amount: result.paymentIntent.amount }
      );
    }

    this.props
      .createDCPurchase(
        result.paymentIntent.amount,
        paymentMethod.card.brand,
        paymentMethod.card.last4,
        result.paymentIntent.id,
        this.state.description
      )
      .then(() => {})
      .catch((err) => {
        this.createDCPurchaseAfterSuccess(result, paymentMethod, attempt + 1);
      });
  };

  onRadioChange = (e) => {
    this.card.clear();
    this.setState({ paymentMethodSelected: e.target.value });
  };

  handleClose = () => {
    setTimeout(() => this.handleBack(), 200);
    this.props.onClose();
  };

  toggleQREntry = () => {
    if (!this.state.manualQREntry) {
      analyticsLogger.logEvent("ACTION_OPEN_PURCHASE_DC_MODAL_MANUAL_ENTRY");
    }
    this.setState({ manualQREntry: !this.state.manualQREntry });
  };

  renderCountSelection = () => {
    const { countUSD, countB } = this.state;
    const costMultiplier = window.dc_cost_multiplier || 1;
    return (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Text>{`1 DC = 24 Byte Packet = $${
          0.00001 * costMultiplier
        } USD`}</Text>
        <br />
        <Text
          strong
          style={{
            padding: this.props.mobile ? "0px 15px" : 0,
            width: this.props.mobile ? "100%" : "80%",
            textAlign: "center",
          }}
        >
          Data Credits purchased on Console can only be used for device packet
          transfer and are non-transferrable.
        </Text>
      </div>
    );
  };

  renderPayment = () => {
    const { paymentMethods, mobile } = this.props;
    return (
      <div style={{ padding: mobile ? 15 : 0 }}>
        <div
          style={{
            ...styles.container,
            padding: 16,
            marginBottom: 24,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div>
              <Text strong>{this.state.countDC}</Text>
            </div>
            <div>
              <Text>Data Credits</Text>
            </div>
          </div>
          <Text style={styles.costNumber}>
            ${this.state.countUSD || "0.00"}
          </Text>
        </div>

        {paymentMethods.length > 0 && (
          <ExistingPaymentCards
            paymentMethods={paymentMethods}
            paymentMethodSelected={this.state.paymentMethodSelected}
            onRadioChange={this.onRadioChange}
          />
        )}

        <div>
          <Text strong>{paymentMethods.length > 0 && "...or "}Add Card</Text>
          {open && <StripeCardElement id="card-element-purchase-flow" />}
        </div>
      </div>
    );
  };

  renderRedeemTransaction = () => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: 0,
        }}
      >
        <div>
          <Input
            name="transactionID"
            placeholder="Transaction ID"
            onChange={this.handleTransactionIdUpdate}
            style={{
              width: 300,
              marginRight: 5,
              verticalAlign: "middle",
            }}
          />
          <Button type="primary" disabled={this.state.transactionId.length < 20} onClick={() => this.handleRedeemTransaction(this.state.transactionId)}>
            Redeem
          </Button>
        </div>
      </div>
    );
  };

  renderDCPortal = () => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: -30,
        }}
      >
        <Text
          style={{
            textAlign: "center",
            display: "block",
          }}
        >
          To purchase DC, click <a target="_blank" href={`https://dc-portal.helium.com/?memo=${this.state.memo}&oui=1`}>this link</a> to visit the DC Portal. Once your purchase is paid for and confirmed, you will receive a transaction ID.
        </Text>
        <Text
          style={{
            textAlign: "center",
            display: "block",
            marginTop: 12
          }}
        >
          You can then redeem your purchased DC to your organization by clicking Redeem Transaction.
        </Text>
      </div>
    );
  };

  renderQRCode = () => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: -30,
        }}
      >
        <Text
          style={{
            textAlign: "center",
            display: "block",
          }}
        >
          Scan the QR Code to initiate a DC burn transaction in your Helium App. Submit the transaction to receive a confirmed transaction ID.
        </Text>
        {this.state.qrContent ? (
          <div style={{ textAlign: "center", marginTop: 6 }}>
            <QRCode value={this.state.qrContent} size={160} />
            <Text
              style={{
                textAlign: "center",
                display: "block",
                marginTop: 12
              }}
            >
              You can then redeem your purchased DC to your organization by clicking Redeem Transaction.
            </Text>
          </div>
        ) : (
          <Text
            style={{
              textAlign: "center",
              color: "#FF4D4F",
              display: "block",
            }}
          >
            Could not generate valid QR Code, please try again.
          </Text>
        )}
      </div>
    );
  };

  renderModalFooter = () => {
    if (this.state.showPage == "creditcard")
      return [
        <Button
          key="back"
          onClick={this.handleBack}
          disabled={this.state.loading}
        >
          Back
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={this.handleSubmit}
          disabled={this.state.loading}
        >
          Make Payment
        </Button>,
      ];
    if (this.state.showPage == "dcPortal")
      return [
        <Button key="back" onClick={this.handleBack}>
          Back
        </Button>,
        <Button key="submit" type="primary" onClick={this.showRedeemTransaction}>
          Redeem Transaction
        </Button>,
      ];
    if (this.state.showPage == "qrCode")
      return [
        <Button key="back" onClick={this.handleBack}>
          Back
        </Button>,
        <Button key="submit" type="primary" onClick={this.showRedeemTransaction}>
          Redeem Transaction
        </Button>,
      ];
    if (this.state.showPage == "redeemTransaction")
      return [
        <Button key="back" onClick={this.handleBack}>
          Back
        </Button>,
        <Button key="submit" type="primary" onClick={this.handleClose}>
          Close
        </Button>,
      ];

    const stripe_min_purchase = window.stripe_minimum_purchase
      ? parseFloat(window.stripe_minimum_purchase)
      : 10;
    const allButtons = [
      <Button
        key="dcPortal"
        type="primary"
        onClick={this.showDCPortal}
        style={{ marginTop: 6 }}
      >
        Purchase with DC Portal
      </Button>,
      <Button
        key="qrCode"
        type="primary"
        onClick={this.showQRCode}
        style={{ marginTop: 6 }}
      >
        Delegate from Helium Wallet
      </Button>,
      <Button
        key="redeemTransaction"
        type="primary"
        onClick={this.showRedeemTransaction}
        style={{ marginTop: 12 }}
      >
        Redeem Transaction
      </Button>,
    ];

    if (!process.env.SELF_HOSTED) {
      return allButtons;
    }
    if (process.env.SELF_HOSTED) {
      let buttons = [allButtons[0]];
      if (window.disable_user_burn !== "true") {
        buttons = buttons.concat(allButtons[1]);
      }
      if (window.stripe_public_key) {
        buttons = buttons.concat(allButtons[2]);
      }
      return buttons;
    }
  };

  render() {
    const { open } = this.props;
    const { loading } = this.state;
    let title = "How many Data Credits do you wish to purchase?";
    if (this.state.showPage == "creditcard")
      title = "Purchase DC with Credit Card";
    if (this.state.showPage == "dcPortal")
      title = "Purchase through the DC portal";
    if (this.state.showPage == "qrCode")
      title = "Use Helium App to Burn HNT";
    if (this.state.showPage == "redeemTransaction")
      title = "Redeem purchased DC";

    return (
      <Modal
        title={
          <div>
            {title}
          </div>
        }
        visible={open}
        onCancel={loading ? () => {} : this.handleClose}
        centered
        footer={this.renderModalFooter()}
        bodyStyle={{
          padding: (this.state.showPage == "default" || this.props.mobile) && 0,
        }}
        width={560}
      >
        {this.state.showPage == "default" && this.renderCountSelection()}
        {this.state.showPage == "creditcard" && this.renderPayment()}
        {this.state.showPage == "qrCode" && this.renderQRCode()}
        {this.state.showPage == "dcPortal" && this.renderDCPortal()}
        {this.state.showPage == "redeemTransaction" && this.renderRedeemTransaction()}
      </Modal>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      createCustomerIdAndCharge,
      createCharge,
      setDefaultPaymentMethod,
      createDCPurchase,
      setAutomaticPayments,
      generateMemo,
      redeemTransaction,
      getRouterAddress,
    },
    dispatch
  );
}

export default PurchaseCreditModal;
