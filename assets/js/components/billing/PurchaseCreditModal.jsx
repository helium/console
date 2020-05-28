import React, { Component } from 'react'
import analyticsLogger from '../../util/analyticsLogger'
import { Modal, Button, Typography, Input, Divider, Icon, Row, Col, Select } from 'antd';
const { Text } = Typography
const { Option } = Select

const styles = {
  container: {
    marginTop: 12,
    backgroundColor: '#E6F7FF',
    padding: 24,
    borderRadius: 8,
  },
  inputHeader: {
    color: '#096DD9',
  },
  input: {
    marginTop: 8
  },
  costNumber: {
    color: '#4091F7',
    fontSize: 30,
    marginTop: -8
  },
}

class PurchaseCreditModal extends Component {
  state = {
    showPayment: false,
    countDC: undefined,
    countUSD: undefined,
    countB: undefined,
    chargeOption: 'once',
  }

  handleCountInputUpdate = (e) => {
    if (e.target.value < 0) return

    if (e.target.name == 'countDC') {
      this.setState({
        countDC: e.target.value,
        countUSD: e.target.value / 10000,
        countB: e.target.value * 24
      })
    }
    if (e.target.name == 'countB') {
      this.setState({
        countDC: e.target.value / 24,
        countUSD: e.target.value / 24 / 10000,
        countB: e.target.value
      })
    }
    if (e.target.name == 'countUSD') {
      this.setState({
        countDC: e.target.value * 10000,
        countUSD: e.target.value,
        countB: e.target.value * 10000 * 24
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

  handleNext = () => {
    this.setState({ showPayment: true })
  }

  handleBack = () => {
    this.setState({ showPayment: false })
  }

  handleSubmit = (e) => {
    e.preventDefault();

    // analyticsLogger.logEvent("ACTION_CREATE_NEW_PAYMENT_METHOD", { "organization": organization.id, "email": email, "role": role })

    this.props.onClose()
  }

  handleSelectCharge = chargeOption => {
    this.setState({ chargeOption })
  }

  renderCountSelection = () => {
    return(
      <div>
        <Text strong>Enter a quantity you wish to purchase</Text>
        <div style={styles.container}>
          <Row gutter={12} style={{ marginBottom: 12 }}>
            <Col span={12}>
              <Text style={styles.inputHeader}>Amount of Data Credits</Text>
              <Input
                placeholder="Enter Quantity"
                name="countDC"
                value={this.state.countDC}
                onChange={this.handleCountInputUpdate}
                style={styles.input}
                type="number"
              />
            </Col>
            <Col span={12}>
              <Text style={styles.inputHeader}>Amount of Bytes</Text>
              <Input
                placeholder="Enter Quantity"
                name="countB"
                value={this.state.countB}
                onChange={this.handleCountInputUpdate}
                style={styles.input}
                type="number"
              />
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Text style={styles.inputHeader}>Amount in USD$</Text>
              <Input
                placeholder="Enter Quantity"
                name="countUSD"
                value={this.state.countUSD}
                onChange={this.handleCountInputUpdate}
                style={styles.input}
                type="number"
              />
            </Col>
          </Row>
        </div>
        {
          this.state.countDC && (
            <div>
              <Divider style={{ marginTop: 32, marginBottom: 12 }}/>
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Text strong>Cost</Text>
                <Text style={styles.costNumber}>${this.state.countUSD || "0.00"}</Text>
              </div>
              <div style={{ marginBottom: 8, marginTop: 12 }}>
                <Text strong>When to Charge</Text>
              </div>
              <Select
                defaultValue={this.state.chargeOption}
                onChange={this.handleSelectCharge}
                style={{ width: '100%'}}
              >
                <Option value="once">One time purchase</Option>
                <Option value="10%">10% remaining</Option>
                <Option value="monthly">Monthly (same amount)</Option>
              </Select>
            </div>
          )
        }
      </div>
    )
  }

  renderPayment = () => {

  }

  render() {
    const { open, onClose } = this.props

    return (
      <Modal
        title="Purchase Data Credits"
        visible={open}
        onCancel={onClose}
        centered
        footer={
          this.state.showPayment ?
          [
            <Button key="back" onClick={this.handleBack}>
              Back
            </Button>,
            <Button key="submit" type="primary" onClick={this.handleSubmit}>
              Make Payment
            </Button>,
          ] :
          [
            <Button key="back" onClick={onClose}>
              Cancel
            </Button>,
            <Button key="submit" type="primary" onClick={this.handleNext} disabled={!this.state.countDC || this.state.countDC == 0}>
              Continue To Payment
            </Button>,
          ]
        }
      >
        {!this.state.showPayment && this.renderCountSelection()}
        {this.state.showPayment && this.renderPayment()}
      </Modal>
    )
  }
}

export default PurchaseCreditModal
