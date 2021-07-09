import React from 'react'
import { Typography, Input, Row, Col } from 'antd';
import CopyOutlined from '@ant-design/icons/CopyOutlined';
import { CopyToClipboard } from 'react-copy-to-clipboard';
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
            suffix={<CopyToClipboard text={address}><CopyOutlined style={{ color: "#4091F7" }} /></CopyToClipboard>}
          />
        </Col>
      </Row>
      <Row gutter={24} style={{ marginBottom: 12 }}>
        <Col span={12}>
          <Text style={styles.inputHeader}>Include Memo:</Text>
          <Input
            value={memo}
            style={styles.input}
            suffix={<CopyToClipboard text={memo}><CopyOutlined style={{ color: "#4091F7" }} /></CopyToClipboard>}
          />
        </Col>
        <Col span={12}>
          <Text style={styles.inputHeader}>Amount HNT</Text>
          <Input
            value={hntToBurn}
            style={styles.input}
            suffix={<CopyToClipboard text={hntToBurn}><CopyOutlined style={{ color: "#4091F7" }} /></CopyToClipboard>}
          />
        </Col>
      </Row>
    </div>

    <div style={{ paddingLeft: 30, paddingRight: 30, marginTop: 20, textAlign: 'center' }}>
      <Text style={{ color: '#FF4D4F'}}>Follow directions to use Wallet CLI tool on developer.helium.com</Text>
    </div>
  </div>
)

export default BurnManualEntry
