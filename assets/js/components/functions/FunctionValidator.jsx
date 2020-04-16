import React, { Component } from 'react'
import DashboardLayout from '../common/DashboardLayout'
import { primaryBlue } from '../../util/colors'
import { Typography, Card, Icon, Input, InputNumber, Row, Col } from 'antd';
const { Text } = Typography
const { TextArea } = Input
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';

class FunctionValidator extends Component {
  render() {
    return (
      <Row gutter={20} type="flex">
        <Col sm={14}>
          <Card title={this.props.title} style={{ height: 'calc(100% - 20px)'}} bodyStyle={{ padding: 0 }}>
            <div>
              <Editor
                value={this.props.body}
                onValueChange={this.props.handleFunctionUpdate}
                highlight={code => highlight(code, languages.js)}
                padding={10}
                style={{
                  fontFamily: 'monospace',
                  fontSize: 14,
                }}
              />
            </div>
          </Card>
        </Col>

        <Col sm={10}>
          <Card
            title="Script Validator"
            extra={
              <Icon type="play-circle" theme="filled" style={{ color: primaryBlue, fontSize: 22 }} onClick={() => {}}/>
            }
          >
            <Row gutter={10}>
              <Col span={16}>
                <Text>Payload Input</Text>
                <Input
                  style={{ marginTop: 5, width: '100%' }}
                  placeholder="Enter encoded payload here"
                />
              </Col>
              <Col span={8}>
                <Text>Port</Text>
                <InputNumber
                  type="number"
                  style={{ marginTop: 5, width: '100%' }}
                />
              </Col>
            </Row>
            <div style={{ marginTop: 24 }}>
              <Text>Payload Output</Text>
              <TextArea
                value={"test"}
                style={{ minHeight: 200, maxHeight: 200, marginTop: 5 }}
              />
            </div>
          </Card>
        </Col>
      </Row>
    )
  }
}

export default FunctionValidator
