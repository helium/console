import React, { Component } from 'react'
import analyticsLogger from '../../util/analyticsLogger'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { setAutomaticPayments } from '../../actions/dataCredits'
import numeral from 'numeral'
import AmountEntryCalculator from './AmountEntryCalculator'
import PaymentCard from './PaymentCard'
import { Modal, Button, Typography, Select, Row, Col, Checkbox } from 'antd';
const { Text } = Typography
const { Option } = Select

const styles = {
  container: {
    marginBottom: 30,
  },
  checkboxContainer: {
    marginTop: 30,
    display: 'flex',
    flexDirection: 'row'
  }
}

@connect(null, mapDispatchToProps)
class AutomaticRenewalModal extends Component {
  state = {
    countDC: undefined,
    countUSD: undefined,
    countB: undefined,
    chargeOption: null,
    checked: false,
    paymentMethod: null,
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.open && this.props.open) {
      this.setState({ checked: false })
    }
    
    if (!prevProps.open && this.props.open) {
      analyticsLogger.logEvent("ACTION_OPEN_AUTO_RENEW_MODAL")
      this.setState({
        chargeOption: '$5',
        paymentMethod: this.props.organization.automatic_payment_method || null,
        countUSD: this.props.organization.automatic_charge_amount && this.props.organization.automatic_charge_amount / 100,
        countDC: this.props.organization.automatic_charge_amount && this.props.organization.automatic_charge_amount * 1000,
        countB: this.props.organization.automatic_charge_amount && this.props.organization.automatic_charge_amount * 24000
      })
    }
  }

  handleCountInputUpdate = (e) => {
    if (e.target.value < 0) return
    if (e.target.value.length > 7) return
    if (e.target.value.split('.')[1] && e.target.value.split('.')[1].length > 2) return
    // Refactor out conversion rates between USD, DC, Bytes later
    if (e.target.name == 'countUSD') {
      this.setState({
        countDC: numeral(e.target.value * 100000).format('0,0'),
        countUSD: e.target.value,
        countB: e.target.value * 100000 * 24
      })
    }
    if (e.target.value == '') {
      this.setState({
        countDC: undefined,
        countUSD: undefined,
        countB: undefined,
      })
    }
  }

  handleSelectCharge = chargeOption => {
    if (chargeOption != 'none') {
      this.setState({ chargeOption })
    } else {
      this.setState({
        chargeOption,
        countDC: undefined,
        countUSD: undefined,
        countB: undefined,
        checked: false,
        paymentMethod: null,
      })
    }
  }

  handleSelectPaymentMethod = paymentMethod => {
    this.setState({ paymentMethod })
  }

  handleSubmit = (e) => {
    e.preventDefault();

    const { paymentMethod, chargeOption, countUSD } = this.state
    this.props.setAutomaticPayments(countUSD ? countUSD : 0, paymentMethod, chargeOption)

    if (countUSD) {
      analyticsLogger.logEvent("ACTION_ADD_AUTO_RENEW", { "organization_id": this.props.organization.id, "amount": countUSD })
    } else {
      analyticsLogger.logEvent("ACTION_REMOVE_AUTO_RENEW", { "organization_id": this.props.organization.id })
    }

    this.props.onClose()
  }

  render() {
    const { open, onClose, paymentMethods, organization } = this.props

    return(
      <Modal
        title="Automatic Renewals"
        visible={open}
        onCancel={onClose}
        centered
        footer={
          [
            <Button key="back" onClick={this.props.onClose}>
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={this.handleSubmit}
              disabled={
                this.state.chargeOption != 'none' && (
                  !this.state.countUSD ||
                  this.state.countUSD <= 0 ||
                  !this.state.paymentMethod ||
                  !this.state.checked
                )
              }
            >
              Save Changes
            </Button>,
          ]
        }
      >
        <div style={styles.container}>
          <AmountEntryCalculator
            countDC={this.state.countDC}
            countB={this.state.countB}
            countUSD={this.state.countUSD}
            handleCountInputUpdate={this.handleCountInputUpdate}
          />
        </div>
        <Row gutter={12}>
          <Col span={12}>
            <Text strong>Payment Method</Text>
            <Select
              value={this.state.paymentMethod}
              onChange={this.handleSelectPaymentMethod}
              style={{ width: '100%', marginTop: 8 }}
              size="large"
            >
              {
                paymentMethods.map(p => (
                  <Option value={p.id} key={p.id}>
                    <PaymentCard id={p.id} card={p.card} style={{ fontWeight: 400, marginTop: -1 }}/>
                  </Option>
                ))
              }
            </Select>
          </Col>
          <Col span={12}>
            <Text strong>When to Charge</Text>
            {
              organization && (
                <Select
                  value={this.state.chargeOption}
                  onChange={this.handleSelectCharge}
                  style={{ width: '100%', marginTop: 8 }}
                  size="large"
                >
                  {
                    organization.automatic_charge_amount && <Option value="none">Never</Option>
                  }
                  <Option value="$5">500,000 DC or less remaining</Option>
                </Select>
              )
            }
          </Col>
        </Row>
        <div style={{ marginTop: 8 }}>
          <Text>
            The amount above will be added to your account when your DC balance reaches 500,000 DC ($5).
          </Text>
        </div>
        <div style={styles.checkboxContainer}>
          <Checkbox
            onChange={e => this.setState({ checked: e.target.checked })}
            checked={this.state.checked}
            style={{ marginRight: 8 }}
          />
          <Text style={{ color: '#8C8C8C' }}>
            I authorize the use of the payment method above to be
            automatically charged according to Helium's Terms & Conditions.
          </Text>
        </div>
      </Modal>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ setAutomaticPayments }, dispatch)
}

export default AutomaticRenewalModal
