import React from 'react'
import { Typography, Input, Row, Col } from 'antd';
const { Text } = Typography

const styles = {
  container: {
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
  blueText: {
    color: '#4091F7',
    fontSize: 14
  }
}

const AmountEntryCalculator = ({ countDC, countB, countUSD, handleCountInputUpdate, disabled, mobile }) => (
  <div>
    <Text strong>Enter the quantity to purchase (minimum ${window.stripe_minimum_purchase || 10})</Text>
    <div style={{ ...styles.container, marginTop: 12 }}>
      <Row gutter={24} style={{ marginBottom: 12 }}>
        <Col span={14}>
          <Text style={styles.inputHeader}>Amount in USD</Text>
          <Input
            placeholder="Enter Quantity"
            name="countUSD"
            value={countUSD}
            onChange={handleCountInputUpdate}
            style={styles.input}
            type="number"
            disabled={disabled}
          />
        </Col>
        <Col span={10}>
          {
            countDC && (
              <div style={{ marginTop: 20 }}>
                <Text style={{ ...styles.blueText, fontSize: 18 }}>{countDC} DC</Text>
              </div>
            )
          }
          {
            countB > 0 && (
              <div style={{ marginTop: -4 }}>
                <Text style={styles.blueText}>{mobile ? convertToTextShort(countB) : convertToText(countB)}</Text>
              </div>
            )
          }
        </Col>
      </Row>
    </div>
  </div>
)

const convertToText = countB => {
  if (countB >= 1000 && countB < 1000000) return `~ ${countB / 1000} KB of Data`
  if (countB >= 1000000 && countB < 1000000000) return `~ ${countB / 1000000} MB of Data`
  if (countB >= 1000000000) return `~ ${countB / 1000000000} GB of Data`
  return `~ ${countB} Bytes of Data`
}

export const convertToTextShort = countB => {
  if (countB >= 1000 && countB < 1000000) return `~${countB / 1000}KB`
  if (countB >= 1000000 && countB < 1000000000) return `~${countB / 1000000}MB`
  if (countB >= 1000000000) return `~${countB / 1000000000}GB`
  return `~${countB}B`
}

export default AmountEntryCalculator
