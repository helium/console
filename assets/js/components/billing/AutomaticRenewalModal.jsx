import React, { Component } from 'react'
import analyticsLogger from '../../util/analyticsLogger'
import AmountEntryCalculator from './AmountEntryCalculator'
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

class AutomaticRenewalModal extends Component {
  state = {
    countDC: undefined,
    countUSD: undefined,
    countB: undefined,
    chargeOption: '10%',
    checked: false
  }

  handleCountInputUpdate = (e) => {
    if (e.target.value < 0) return

    if (e.target.name == 'countDC') {
      this.setState({
        countDC: e.target.value,
        countUSD: e.target.value / 100000,
        countB: e.target.value * 24
      })
    }
    if (e.target.name == 'countUSD') {
      this.setState({
        countDC: e.target.value * 100000,
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
    this.setState({ chargeOption })
  }

  handleSubmit = (e) => {
    e.preventDefault();

    // analyticsLogger.logEvent("ACTION_CREATE_NEW_PAYMENT_METHOD", { "organization": organization.id, "email": email, "role": role })

    this.props.onClose()
  }

  render() {
    const { open, onClose } = this.props

    return(
      <Modal
        title="Automatic Renewals"
        visible={open}
        onCancel={onClose}
        centered
        footer={
          [
            <Button key="back" onClick={this.handleBack}>
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={this.handleSubmit}
              disabled={!this.state.checked || !this.state.countUSD || this.state.countUSD <= 0}
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
              defaultValue=""
              onChange={() => {}}
              style={{ width: '100%', marginTop: 8 }}
            >
              <Option value="one">Card One</Option>
            </Select>
          </Col>
          <Col span={12}>
            <Text strong>When to Charge</Text>
            <Select
              defaultValue={this.state.chargeOption}
              onChange={this.handleSelectCharge}
              style={{ width: '100%', marginTop: 8 }}
            >
              <Option value="10%">10% remaining</Option>
            </Select>
          </Col>
        </Row>
        <div style={styles.checkboxContainer}>
          <Checkbox
            onChange={e => this.setState({ checked: e.target.checked })}
            checked={this.state.checked}
            style={{ marginRight: 8 }}
          />
          <Text>I authorize the use of the payment method above to be automatically charged according to Helium's Terms & Conditions.</Text>
        </div>
      </Modal>
    )
  }
}

export default AutomaticRenewalModal
