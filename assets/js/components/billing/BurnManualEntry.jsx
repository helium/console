import React, { Component } from 'react'
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

const BurnManualEntry = ({ hntToBurn, memo, address}) => (
  <div>
    <div style={{ ...styles.container, marginTop: 12 }}>
      <Row gutter={24} style={{ marginBottom: 12 }}>
        <Col span={24}>
          <Text style={styles.inputHeader}>Address to Burn HNT to:</Text>
          <Input
            value={address}
            style={styles.input}
          />
        </Col>
      </Row>
      <Row gutter={24} style={{ marginBottom: 12 }}>
        <Col span={12}>
          <Text style={styles.inputHeader}>Include Memo:</Text>
          <Input
            value={memo}
            style={styles.input}
          />
        </Col>
        <Col span={12}>
          <Text style={styles.inputHeader}>Amount HNT</Text>
          <Input
            value={hntToBurn}
            style={styles.input}
          />
        </Col>
      </Row>
    </div>

    <div style={{ paddingLeft: 30, paddingRight: 30, marginTop: 20, textAlign: 'center' }}>
      <Text style={{ color: '#FF4D4F'}}>If using the CLI Tool, please ensure you mark your transaction as a ‘Burn HNT’ Transaction</Text>
    </div>
  </div>
)

export default BurnManualEntry
