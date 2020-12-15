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
    const { functions, from, channel } = this.props
    const fromChannelNew = from === 'channelNew'

    const firstFunc = functions[0]
    if (firstFunc && firstFunc.format === 'browan_object_locator') {
      this.setState({ typeSelected: 'browan' })
    } else if (firstFunc && firstFunc.format === 'cayenne') {
      this.setState({ typeSelected: 'cayenne' })
    } else {
      this.setState({ typeSelected: 'default' })
    }
  }

  componentDidUpdate = (prevProps) => {
    const fromChannelNew = this.props.from === 'channelNew'

    if (prevProps.functions[0] != this.props.functions[0]) {
      const { functions } = this.props

      const firstFunc = functions[0]
      if (firstFunc && firstFunc.format === 'browan_object_locator') {
        this.setState({ typeSelected: 'browan', output: null })
        if (fromChannelNew) {
          this.props.handleTemplateUpdate(templatesMap['browan'])
          setTimeout(this.generateOutput, 200)
        }
      } else if (firstFunc && firstFunc.format === 'cayenne') {
        this.setState({ typeSelected: 'cayenne', output: null })
        if (fromChannelNew) {
          this.props.handleTemplateUpdate(templatesMap['cayenne'])
          setTimeout(this.generateOutput, 200)
        }
      } else {
        this.setState({ typeSelected: 'default', output: null })
        if (fromChannelNew) {
          this.props.handleTemplateUpdate(templatesMap['default'])
          setTimeout(this.generateOutput, 200)
        }
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

    if (!this.props.templateBody || this.props.templateBody.length === 0) {
      displayError("Please provide a valid template body")
    } else {
      const output = Mustache.render(this.props.templateBody, payloadsMap[typeSelected])
      try {
        this.setState({ output })
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

  renderTemplateButtons = () => {
    const { channel, templateBody, from } = this.props
    const { typeSelected } = this.state
    const fromChannelNew = from === 'channelNew'

    if (!fromChannelNew && channel && channel.payload_template === null && templateBody !== '' ) return (
      <span>
        <Button size="small" style={{ marginRight: 8, height: 25 }} onClick={this.resetTemplate}>Undo</Button>
        <Button size="small" type="primary" style={{ marginRight: 0, height: 25 }} onClick={this.props.updateChannelTemplate}>Save</Button>
      </span>
    )
    if (!fromChannelNew && channel && channel.payload_template === null && templateBody === '') return (
      <span>
        <Button size="small" type="primary" style={{ marginRight: 0, height: 25 }} onClick={() => this.selectPayloadType(this.state.typeSelected)}>Apply Default Template</Button>
      </span>
    )
    if (!fromChannelNew && channel && channel.payload_template !== null && templateBody !== channel.payload_template) return (
      <span>
        <Button size="small" style={{ marginRight: 8, height: 25 }} onClick={this.resetTemplate}>Undo</Button>
        <Button size="small" type="primary" style={{ marginRight: 0, height: 25 }} onClick={this.props.updateChannelTemplate}>Save</Button>
      </span>
    )
    if (!fromChannelNew && channel && channel.payload_template !== null && templateBody === channel.payload_template && templateBody !== templatesMap[typeSelected]) return (
      <span>
        <Button size="small" type="primary" style={{ marginRight: 0, height: 25 }} onClick={() => this.selectPayloadType(this.state.typeSelected)}>Apply Default Template</Button>
      </span>
    )
    if (fromChannelNew && templateBody === '') return (
      <span>
        <Button size="small" type="primary" style={{ marginRight: 0, height: 25 }} onClick={() => this.selectPayloadType(this.state.typeSelected)}>Apply Default Template</Button>
      </span>
    )
    if (fromChannelNew && templateBody !== templatesMap[typeSelected]) return (
      <span>
        <Button size="small" type="primary" style={{ marginRight: 0, height: 25 }} onClick={() => this.selectPayloadType(this.state.typeSelected)}>Apply Default Template</Button>
      </span>
    )
  }

  render() {
    if (this.state.show) {
      return (
        <Card
          title={
            <span style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontWeight: 600 }}>Advanced - JSON Message Template (Optional)</Text>
              <Popover
                content={
                  <Text>
                    Users can customize the JSON Message structure sent to Integrations. This is an advanced feature and should only be used by users familiar with logic-less templates.
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
            (this.state.typeSelected === 'default' || this.state.typeSelected === 'custom') && (
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
            this.state.typeSelected === 'browan' && (
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
            this.state.typeSelected === 'cayenne' && (
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
                title={
                  <span style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontWeight: 600 }}>Template Body</Text>
                    <Popover
                      content={
                        <Text>
                          If no template changes are made then the default JSON message is sent.
                        </Text>
                      }
                      placement="top"
                      overlayStyle={{ width: 250 }}
                    >
                      <Icon type="question-circle" theme="filled" style={{ fontSize: 20, color: 'grey', marginLeft: 8 }}/>
                    </Popover>
                  </span>
                }
                bodyStyle={{ padding: 0 }}
                style={{ marginBottom: 0 }}
                extra={this.renderTemplateButtons()}
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
                    value={this.state.output || ""}
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
                    Users can customize the JSON Message structure sent to Integrations. This is an advanced feature and should only be used by users familiar with logic-less templates.
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
