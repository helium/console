import React, { Component } from 'react'
import DashboardLayout from '../common/DashboardLayout'
import { primaryBlue, codeEditorLineColor, codeEditorBgColor } from '../../util/colors'
import { Typography, Card, Icon, Input, InputNumber, Row, Col, Popover } from 'antd';
const { Text } = Typography
import range from 'lodash/range'
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';

class FunctionValidator extends Component {
  state = {
    input: "",
    port: 1,
  }

  componentDidMount() {
    window.addEventListener('message', e => {
      const frame = document.getElementById('myFrame')
      if (e.origin === 'null' && e.source === frame.contentWindow) {
        window.document.getElementById("validatorOutput").textContent = e.data
      }
    })
  }

  onClickEditor = () => {
    const editor = document.getElementsByClassName("npm__react-simple-code-editor__textarea")[0]
    editor.focus()
  }

  runValidator = () => {
    const frame = document.getElementById('myFrame')
    const { port, input } = this.state
    const code = this.props.body + `\nlet parsedInput = "${input}".trim().split(" ").join(""); if (parsedInput.length == 0) { "Payload input must not be blank" } else { if (parsedInput.length % 2 == 1) parsedInput = "0" + parsedInput; parsedInput = parsedInput.match(/.{1,2}/g).map(x => parseInt(x, 16)); if (parsedInput.filter(x => !x).length > 0) { "Payload input could not be validly parsed" } else { JSON.stringify(Decoder(parsedInput, ${port}), null, 4) } }`
    frame.contentWindow.postMessage(code, '*')
  }

  render() {
    return (
      <Row gutter={20} type="flex">
        <Col sm={14}>
          <Card title={this.props.title} style={{ height: 560, overflow: 'hidden'}} bodyStyle={{ padding: 0 }}>
            <div style={{ height: 503, overflowY: 'scroll' }}>
              <div style={{ display: 'flex', flexDirection: 'row', cursor: 'text' }} onClick={this.onClickEditor}>
                <div style={{ backgroundColor: codeEditorBgColor, paddingTop: 9, marginTop: 1, paddingBottom: 9 }}>
                  {
                    range(501).map(i => (
                      <p
                        key={i}
                        style={{
                          textAlign: 'right',
                          fontFamily: 'monospace',
                          color: codeEditorLineColor,
                          fontSize: 14,
                          marginBottom: 0,
                          paddingLeft: 10,
                          paddingRight: 10,
                          backgroundColor: codeEditorBgColor
                        }}
                      >
                        {i}
                      </p>
                    ))
                  }
                </div>

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
            </div>
          </Card>
        </Col>

        <Col sm={10}>
          <Card
            title="Script Validator"
            style={{ height: 560 }}
            extra={
              <Icon type="play-circle" theme="filled" style={{ color: primaryBlue, fontSize: 22 }} onClick={this.runValidator}/>
            }
          >
            <Row gutter={10}>
              <Col span={16}>
                <Text>Payload Input</Text>
                <Input
                  name="input"
                  style={{ marginTop: 5, width: '100%' }}
                  placeholder="Hexadecimal (eg. 20 04 7f ff)"
                  value={this.state.input}
                  onChange={e => this.setState({ input: e.target.value })}
                />
              </Col>
              <Col span={8}>
                <Text>Port</Text>
                <InputNumber
                  type="number"
                  name="port"
                  placeholder="1"
                  style={{ marginTop: 5, width: '100%' }}
                  value={this.state.port}
                  onChange={port => this.setState({ port })}
                />
              </Col>
            </Row>
            <div style={{ marginTop: 24 }}>
              <Text>Payload Output</Text>
              <textarea id="validatorOutput" style={{ minHeight: 340, maxHeight: 340, marginTop: 5, width: '100%', padding: 10, paddingTop: 5, border: 'solid 1px #d9d9d9', borderRadius: 5 }} disabled />
            </div>
          </Card>
        </Col>
      </Row>
    )
  }
}

export default FunctionValidator
