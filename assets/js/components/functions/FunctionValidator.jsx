import React, { Component } from 'react'
import DashboardLayout from '../common/DashboardLayout'
import { primaryBlue } from '../../util/colors'
import { Typography, Card, Icon, Input, Row, Col } from 'antd';
const { Text } = Typography
const { TextArea } = Input
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';

class FunctionValidator extends Component {
  state = {
    code: ""
  }

  render() {
    return (
      <Row gutter={20} type="flex">
        <Col sm={14}>
          <Card title="Step 2 - Enter Custom Script" style={{ height: 'calc(100% - 20px)'}} bodyStyle={{ padding: 0 }}>
          <Editor
            value={this.state.code}
            onValueChange={code => this.setState({ code })}
            highlight={code => highlight(code, languages.js)}
            padding={10}
            style={{
              fontFamily: 'monospace',
              fontSize: 14,
            }}
          />
          </Card>
        </Col>

        <Col sm={10}>
          <Card
            title="Script Validator"
            extra={
              <Icon type="play-circle" theme="filled" style={{ color: primaryBlue, fontSize: 22 }} onClick={() => {}}/>
            }
          >
            <div>
              <Text>Payload Input</Text>
              <Input
                style={{ marginTop: 5 }}
                placeholder="Enter encoded payload here"
              />
            </div>
            <div style={{ marginTop: 24 }}>
              <Text>Payload Output</Text>
              <TextArea
                value={"test"}
                style={{ minHeight: 200, marginTop: 5 }}
              />
            </div>
          </Card>
        </Col>
      </Row>
    )
  }
}

export default FunctionValidator
