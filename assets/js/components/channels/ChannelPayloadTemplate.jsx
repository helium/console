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
import 'prismjs/themes/prism-coy.css';

const payloadsMap = {
  default: defaultPayload,
  browan: browanPayload,
  cayenne: cayennePayload,
  custom: defaultPayload,
}

const templatesMap = {
  default: defaultTemplate,
  browan: browanTemplate,
  cayenne: cayenneTemplate,
  custom: defaultTemplate,
}

class ChannelPayloadTemplate extends Component {
  state = {
    typeSelected: null,
    output: null,
    show: false,
  }

  componentDidMount = () => {
    const { functions } = this.props

    const firstFunc = functions[0]
    if (firstFunc && firstFunc.format == 'browan_object_locator') {
      this.setState({ typeSelected: 'browan' })
    } else if (firstFunc && firstFunc.format == 'cayenne') {
      this.setState({ typeSelected: 'cayenne' })
    } else {
      this.setState({ typeSelected: 'default' })
    }
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.functions[0] != this.props.functions[0]) {
      const { functions } = this.props

      const firstFunc = functions[0]
      if (firstFunc && firstFunc.format == 'browan_object_locator') {
        this.setState({ typeSelected: 'browan', output: null })
      } else if (firstFunc && firstFunc.format == 'cayenne') {
        this.setState({ typeSelected: 'cayenne', output: null })
      } else {
        this.setState({ typeSelected: 'default', output: null })
      }
    }
  }

  onClickEditor = () => {
    const editor = document.getElementsByClassName("npm__react-simple-code-editor__textarea")[1]
    editor.focus()
  }

  resetTemplate = () => {
    this.props.handleTemplateUpdate(this.props.channel.payload_template)
  }

  selectPayloadType = value => {
    this.props.handleTemplateUpdate(templatesMap[value])
    this.setState({ typeSelected: value, output: null }, this.generateOutput)
  }

  generateOutput = () => {
    const { typeSelected } = this.state

    if (!this.props.templateBody || this.props.templateBody.length == 0) {
      displayError("Please provide a valid template body")
    } else {
      const output = Mustache.render(this.props.templateBody, payloadsMap[typeSelected])
      try {
        const parsedOutput = JSON.parse(output)
        this.setState({ output: parsedOutput })
      } catch(err) {
        displayError("Issue with generating output, please check your template body")
        this.setState({ output: null })
      }
    }
  }

  hidePanel = () => {
    const { channel } = this.props
    this.setState({ show: false, typeSelected: null, output: null, customPayloadBody: "" })
    this.props.handleTemplateUpdate(channel ? channel.payload_template : "")
  }

  render() {
    const templateDiff = this.props.channel && (this.props.channel.payload_template != this.props.templateBody)

    if (this.state.show) {
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
          extra={
            <Button
              type="primary"
              onClick={this.hidePanel}
            >
              Hide Details
            </Button>
          }
        >
          {
            (this.state.typeSelected == 'default' || this.state.typeSelected == 'custom') && (
              <Card
                title="JSON Message"
                bodyStyle={{ padding: 0 }}
                style={{ marginBottom: 16 }}
              >
                <div style={{ height: 303, overflowY: 'scroll' }}>
                  <Editor
                    value={JSON.stringify(defaultPayload, null, 2)}
                    onValueChange={() => {}}
                    highlight={code => highlight(code, languages.js)}
                    padding={10}
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 14,
                    }}
                  />
                </div>
              </Card>
            )
          }

          {
            this.state.typeSelected == 'browan' && (
              <Card
                title="JSON Message"
                bodyStyle={{ padding: 0 }}
                style={{ marginBottom: 16 }}
              >
                <div style={{ height: 303, overflowY: 'scroll' }}>
                  <Editor
                    value={JSON.stringify(browanPayload, null, 2)}
                    onValueChange={() => {}}
                    highlight={code => highlight(code, languages.js)}
                    padding={10}
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 14,
                    }}
                  />
                </div>
              </Card>
            )
          }

          {
            this.state.typeSelected == 'cayenne' && (
              <Card
                title="JSON Message"
                bodyStyle={{ padding: 0 }}
                style={{ marginBottom: 16 }}
              >
                <div style={{ height: 303, overflowY: 'scroll' }}>
                  <Editor
                    value={JSON.stringify(cayennePayload, null, 2)}
                    onValueChange={() => {}}
                    highlight={code => highlight(code, languages.js)}
                    padding={10}
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 14,
                    }}
                  />
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
                      templateDiff && this.props.channel.payload_template && <Button size="small" style={{ marginRight: 8, height: 25 }} onClick={this.resetTemplate}>Clear Changes</Button>
                    }
                    {
                      templateDiff && <Button size="small" type="primary" style={{ marginRight: 0, height: 25 }} onClick={this.props.updateChannelTemplate}>Save</Button>
                    }
                    {
                      !templateDiff && this.props.channel.payload_template != templatesMap[this.state.typeSelected] && (
                        <Button size="small" type="primary" style={{ marginRight: 0, height: 25 }} onClick={() => this.selectPayloadType(this.state.typeSelected)}>See Example Template</Button>
                      )
                    }
                  </span>
                }
              >
                <div style={{ height: 503, overflowY: 'scroll' }}>
                  <div style={{ display: 'flex', flexDirection: 'row', cursor: 'text' }} onClick={this.onClickEditor}>
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
                    onValueChange={() => {}}
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
    } else {
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
          bodyStyle={{
            padding: 0
          }}
          extra={
            <Button type="primary" onClick={() => this.setState({ show: true })}>Show Details</Button>
          }
        />
      )
    }
  }
}

export default ChannelPayloadTemplate
