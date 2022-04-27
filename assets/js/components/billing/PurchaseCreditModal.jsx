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
      if (this.state.countDC) {
        this.setState({ gettingPrice: true, hntToBurn: null });
        this.getOraclePrice();
      }
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
        gettingPrice: true,
      });
      this.getOraclePrice();
    }
    if (e.target.value == "") {
      this.setState({
        countDC: undefined,
        countUSD: undefined,
        countB: undefined,
      });
    }
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

  showQRCode = () => {
    analyticsLogger.logEvent("ACTION_OPEN_PURCHASE_DC_MODAL_QR_CODE");
    if (this.state.routerAddress === "") {
      this.props.getRouterAddress().then(({ data }) => {
        if (typeof data.address === "string") {
          this.setState({ routerAddress: data.address });
        }
      });
    }

    this.props.generateMemo().then(({ data }) => {
      const qr = {
        type: "dc_burn",
        address: this.state.routerAddress,
        amount: this.state.hntToBurn,
        memo: data.memo,
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
        {!process.env.SELF_HOSTED ||
          (window.stripe_public_key && (
            <Text>
              (Credit Card purchases: minimum $
              {window.stripe_minimum_purchase || 10})
            </Text>
          ))}
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
        <div
          style={
            this.props.mobile ? styles.countBlueBoxMobile : styles.countBlueBox
          }
        >
          <div>
            <Input
              placeholder="Enter Quantity"
              name="countDC"
              value={this.state.countDC}
              onChange={this.handleCountInputUpdate}
              type="number"
              suffix={
                <span style={{ paddingRight: 10 }}>
                  <Text>DC</Text>
                </span>
              }
              style={{ paddingLeft: 10, paddingRight: 10 }}
            />
          </div>
          {this.state.countUSD > 0 && (
            <div style={styles.costContainer}>
              <Text style={{ color: "#4091F7", marginTop: -5 }}>Cost:</Text>
              <Text style={styles.costNumber}>
                ${countUSD && parseFloat(countUSD).toFixed(2)}
              </Text>
            </div>
          )}
        </div>
        <div style={{ padding: "20px 0", width: "75%" }}>
          <Input
            name="description"
            value={this.state.description}
            onChange={(e) => {
              this.setState({ description: e.target.value });
            }}
            addonBefore={
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                Memo
                <Popover
                  content="For Stripe payments only, this will show on the emailed receipt."
                  placement="bottom"
                >
                  <InfoCircleOutlined
                    style={{ fontSize: 16, marginLeft: 10 }}
                  />
                </Popover>
              </div>
            }
          />
        </div>
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
        <div
          style={{
            height: 30,
            width: "100%",
            paddingLeft: this.props.mobile ? 15 : 50,
            paddingRight: this.props.mobile ? 15 : 50,
            marginBottom: 60,
          }}
        >
          {this.state.hntToBurn && (
            <BurnHNTPillbox
              hntToBurn={this.state.hntToBurn}
              nextTimeStamp={this.state.nextTimeStamp}
              onComplete={this.getOraclePrice}
            />
          )}
        </div>
        {this.state.routerAddress === "" && (
          <div>
            <Text
              style={{
                textAlign: "center",
                color: "#FF4D4F",
                display: "block",
              }}
            >
              Router address for burning HNT unavailable
            </Text>
            <Text
              style={{
                textAlign: "center",
                color: "#FF4D4F",
                display: "block",
              }}
            >
              {process.env.SELF_HOSTED
                ? "Please make sure your Router is connected to Console through websockets"
                : "Please contact support to enable burn"}
            </Text>
          </div>
        )}
        {this.state.routerAddress !== "" &&
          this.state.qrContent &&
          !this.state.manualQREntry && (
            <QRCode value={this.state.qrContent} size={220} />
          )}
        {this.state.manualQREntry && (
          <BurnManualEntry
            hntToBurn={this.state.hntToBurn}
            memo={this.state.memo}
            address={this.state.routerAddress}
          />
        )}
        <div style={{ marginTop: 20 }}>
          <Link to="#" onClick={this.toggleQREntry}>
            <Text style={{ textDecoration: "underline", color: "#4091F7" }}>
              Use{" "}
              {!this.state.manualQREntry
                ? "Helium Wallet CLI Tool"
                : "Helium App"}
            </Text>
          </Link>
        </div>
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
    if (this.state.showPage == "qrCode")
      return [
        <Button key="back" onClick={this.handleBack}>
          Back
        </Button>,
        <Button key="submit" type="primary" onClick={this.handleClose}>
          Close
        </Button>,
      ];

    const stripe_min_purchase = window.stripe_minimum_purchase
      ? parseInt(window.stripe_minimum_purchase)
      : 10;
    const allButtons = [
      <Button
        key="back"
        onClick={this.handleClose}
        disabled={this.state.loading}
        style={{ marginTop: this.props.mobile ? 6 : 0 }}
      >
        Cancel
      </Button>,
      <Button
        key="submit2"
        type="primary"
        onClick={this.showQRCode}
        disabled={
          !this.state.countUSD ||
          this.state.countUSD == 0 ||
          this.state.gettingPrice
        }
        style={{ marginTop: this.props.mobile ? 6 : 0 }}
      >
        Burn HNT to DC
      </Button>,
      <Button
        key="submit"
        type="primary"
        onClick={this.showCreditCard}
        disabled={
          !this.state.countUSD ||
          this.state.countUSD == 0 ||
          this.state.loading ||
          this.state.gettingPrice ||
          this.state.countUSD < stripe_min_purchase
        }
        style={{ marginTop: this.props.mobile ? 6 : 0 }}
      >
        Purchase with Credit Card
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
    if (this.state.showPage == "qrCode" && !this.state.manualQREntry)
      title = "Use Helium App to Burn HNT using this QR";
    if (this.state.showPage == "qrCode" && this.state.manualQREntry)
      title = "Transaction Details for Wallet CLI Tool";

    return (
      <Modal
        title={
          <div>
            {title}
            {this.state.showPage == "qrCode" && !this.state.manualQREntry && (
              <Popover
                content="On the Helium App, tap Send and open the QR code scanner located on the top left of the screen."
                placement="bottom"
                overlayStyle={{ width: 220 }}
              >
                <InfoCircleOutlined style={{ fontSize: 24, marginLeft: 10 }} />
              </Popover>
            )}
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
      getRouterAddress,
    },
    dispatch
  );
}

export default PurchaseCreditModal;
