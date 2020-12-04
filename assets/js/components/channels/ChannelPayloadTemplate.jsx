import React, { Component } from 'react'
import Mustache from 'mustache'
import { codeEditorLineColor, codeEditorBgColor } from '../../util/colors'
import { displayError } from '../../util/messages'
import { defaultPayload, browanPayload, cayennePayload, defaultTemplate, browanTemplate, cayenneTemplate } from '../../util/integrationTemplates'
import { Typography, Card, Icon, Popover, Select, Row, Col, Button, Input } from 'antd';
const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography
import range from 'lodash/range'
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';

const payloadsMap = {
  default: defaultPayload,
  browan: browanPayload,
  cayenne: cayennePayload,
}

const templatesMap = {
  default: defaultTemplate,
  browan: browanTemplate,
  cayenne: cayenneTemplate,
}

class ChannelPayloadTemplate extends Component {
  state = {
    typeSelected: null,
    output: null,
    customPayloadBody: ""
  }

  onClickEditor = index => {
    const editor = document.getElementsByClassName("npm__react-simple-code-editor__textarea")[index]
    editor.focus()
  }

  selectPayloadType = value => {
    if (value != 'custom') {
      this.props.handleTemplateUpdate(templatesMap[value])
    } else {
      this.props.handleTemplateUpdate("")
    }
    this.setState({ typeSelected: value, output: null })
  }

  resetTemplate = () => {
    this.props.handleTemplateUpdate(this.props.channel.payload_template)
  }

  generateOutput = () => {
    const { typeSelected } = this.state

    if (!this.props.templateBody || this.props.templateBody.length == 0) {
      displayError("Please provide a valid template body")
    } else if (typeSelected == 'custom' && this.state.customPayloadBody.length == 0){
      displayError("Please provide a valid custom payload body")
    } else {
      if (typeSelected && typeSelected != 'custom') {
        const output = Mustache.render(this.props.templateBody, payloadsMap[typeSelected])
        try {
          const parsedOutput = JSON.parse(output)
          this.setState({ output: parsedOutput })
        } catch(err) {
          displayError("Issue with generating output, please check your template body")
          this.setState({ output: null })
        }
      }
      if (typeSelected == 'custom') {
        try {
          const parsedPayloadBody = JSON.parse(this.state.customPayloadBody)
          const output = Mustache.render(this.props.templateBody, parsedPayloadBody)
          try {
            const parsedOutput = JSON.parse(output)
            this.setState({ output: parsedOutput })
          } catch(err) {
            displayError("Issue with generating output, please check your template body")
            this.setState({ output: null })
          }
        } catch(err) {
          displayError("Issue with parsing custom payload body, please verify")
          this.setState({ output: null })
        }
        const output = Mustache.render(this.props.templateBody, JSON.parse(this.state.customPayloadBody))
        this.setState({ output: JSON.parse(output) })
      }
    }
  }

  render() {
    const templateDiff = this.props.channel && (this.props.channel.payload_template != this.props.templateBody)

    return (
      <Card
        title={
          <span style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontWeight: 600 }}>Advanced - JSON Message Template (Optional)</Text>
            <Popover
              content={
                <Text>
                  Users can customize the JSON message sent to Integrations. This is a beta feature and only users familiar with templating should try this feature. For more info, visit <a href="https://engineering.helium.com" target="_blank">https://engineering.helium.com</a>
                </Text>
              }
              placement="top"
              overlayStyle={{ width: 250 }}
            >
              <Icon type="question-circle" theme="filled" style={{ fontSize: 20, color: 'grey', marginLeft: 8 }}/>
            </Popover>
          </span>
        }
      >
        <div style={{ marginBottom: 8 }}>
          <Text strong>
            Select a payload to test below:
          </Text>
        </div>
        <Select style={{ width: 240, marginBottom: 16 }} onSelect={this.selectPayloadType}>
          <Option value="default">Default Payload</Option>
          <Option value="browan">Browan Payload</Option>
          <Option value="cayenne">Cayenne Payload</Option>
          <Option value="custom">Custom Payload</Option>
        </Select>

        {
          this.state.typeSelected == 'custom' && (
            <Card
              title="Your Custom Payload"
              style={{ marginBottom: 16 }}
              bodyStyle={{ padding: 0 }}
            >
              <div style={{ height: 503, overflowY: 'scroll' }}>
                <div style={{ display: 'flex', flexDirection: 'row', cursor: 'text' }} onClick={() => this.onClickEditor(0)}>
                  <div style={{ backgroundColor: codeEditorBgColor, paddingTop: 9, marginTop: 1, paddingBottom: 9 }}>
                    {
                      range(201).map(i => (
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
                    value={this.state.customPayloadBody}
                    onValueChange={customPayloadBody => this.setState({ customPayloadBody })}
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
          )
        }

        <Row gutter={16}>
          <Col span={12}>
            <Card
              title="Template Body"
              bodyStyle={{ padding: 0 }}
              style={{ marginBottom: 0 }}
              extra={
                <span>
                  {
                    templateDiff && this.props.channel.payload_template && <Button size="small" style={{ marginRight: 8 }} onClick={this.resetTemplate}>Clear Changes</Button>
                  }
                  {
                    templateDiff && <Button size="small" type="primary" style={{ marginRight: 0 }} onClick={this.props.updateChannelTemplate}>Save</Button>
                  }
                </span>
              }
            >
              <div style={{ height: 503, overflowY: 'scroll' }}>
                <div style={{ display: 'flex', flexDirection: 'row', cursor: 'text' }} onClick={() => this.onClickEditor(this.state.typeSelected == 'custom' ? 1 : 0)}>
                  <div style={{ backgroundColor: codeEditorBgColor, paddingTop: 9, marginTop: 1, paddingBottom: 9 }}>
                    {
                      range(201).map(i => (
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
                    value={this.props.templateBody}
                    onValueChange={this.props.handleTemplateUpdate}
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
          <Col span={12}>
            <Card
              title="Output"
              bodyStyle={{ padding: 0 }}
              style={{ marginBottom: 0 }}
              extra={
                this.state.typeSelected && (<Button
                  type="primary"
                  shape="circle"
                  icon="caret-right"
                  size="small"
                  style={{ marginRight: 0 }}
                  onClick={this.generateOutput}
                />)
              }
            >
              <div style={{ height: 503, overflowY: 'scroll' }}>
                <Editor
                  value={this.state.output ? JSON.stringify(this.state.output, null, 2) : ""}
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
        </Row>
      </Card>
    )
  }
}

export default ChannelPayloadTemplate
