import React, { Component } from 'react'
import Mustache from 'mustache'
import { codeEditorLineColor, codeEditorBgColor } from '../../util/colors'
import { minWidth } from '../../util/constants'
import { displayError } from '../../util/messages'
import { defaultPayload, browanPayload, cayennePayload, defaultTemplate, browanTemplate, cayenneTemplate, adafruitTemplate } from '../../util/integrationTemplates'
import { Typography, Card, Popover, Row, Col, Button } from 'antd';
import QuestionCircleFilled from '@ant-design/icons/QuestionCircleFilled';
import PlayCircleFilled from '@ant-design/icons/PlayCircleFilled';
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
  adafruit: adafruitTemplate
}

class ChannelPayloadTemplate extends Component {
  state = {
    typeSelected: 'default',
    output: null,
    show: false,
  }

  componentDidMount = () => {
    const { channel } = this.props

    this.setState({ show: channel && !!channel.payload_template })
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (!prevState.show && this.state.show) {
      this.setState({ typeSelected: 'default', output: null })
    }

    if (prevProps.channel !== this.props.channel || ((prevProps.channel && prevProps.channel.id) !== (this.props.channel && this.props.channel.id))) {
      this.setState({ typeSelected: 'default', show: this.props.channel && !!this.props.channel.payload_template, output: null })
    }
  }

  onClickEditor = () => {
    const editor = document.getElementsByClassName("npm__react-simple-code-editor__textarea")[1]
    editor.focus()
  }

  resetTemplate = () => {
    this.props.handleTemplateUpdate(this.props.channel.payload_template)
  }

  selectPayloadType = (value, isAdafruit) => {
    this.props.handleTemplateUpdate(isAdafruit ? templatesMap["adafruit"] : templatesMap[value])
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
    const isAdafruit = channel && channel.credentials && channel.credentials.endpoint && channel.credentials.endpoint.includes('io.adafruit.com');

    if (!fromChannelNew && channel && channel.payload_template === null && templateBody !== '' ) return (
      <span>
        <Button size="small" style={{ marginRight: 8, height: 25 }} onClick={this.resetTemplate}>Undo</Button>
        <Button size="small" type="primary" style={{ marginRight: 0, height: 25 }} onClick={this.props.updateChannelTemplate}>Save</Button>
      </span>
    )
    if (!fromChannelNew && channel && channel.payload_template === null && templateBody === '') return (
      <span>
        <Button size="small" type="primary" style={{ marginRight: 0, height: 25 }} onClick={() => this.selectPayloadType(typeSelected, isAdafruit)}>Apply Default Template</Button>
      </span>
    )
    if (!fromChannelNew && channel && channel.payload_template !== null && templateBody !== channel.payload_template) return (
      <span>
        <Button size="small" style={{ marginRight: 8, height: 25 }} onClick={this.resetTemplate}>Undo</Button>
        <Button size="small" type="primary" style={{ marginRight: 0, height: 25 }} onClick={this.props.updateChannelTemplate}>Save</Button>
      </span>
    )
    if (!fromChannelNew && channel && channel.payload_template !== null && templateBody === channel.payload_template && templateBody !== (isAdafruit ? templatesMap["adafruit"] : templatesMap[typeSelected])) {
      return (
      <span>
        <Button size="small" type="primary" style={{ marginRight: 0, height: 25 }} onClick={() => this.selectPayloadType(typeSelected, isAdafruit)}>Apply Default Template</Button>
      </span>
    )}
    if (fromChannelNew && templateBody === '') return (
      <span>
        <Button size="small" type="primary" style={{ marginRight: 0, height: 25 }} onClick={() => this.selectPayloadType(typeSelected, isAdafruit)}>Apply Default Template</Button>
      </span>
    )
    if (fromChannelNew && templateBody !== (isAdafruit ? templatesMap["adafruit"] : templatesMap[typeSelected])) return (
      <span>
        <Button size="small" type="primary" style={{ marginRight: 0, height: 25 }} onClick={() => this.selectPayloadType(typeSelected, isAdafruit)}>Apply Default Template</Button>
      </span>
    )
  }

  renderJSONbuttons = () => (
    <span>
      <Button
        size="small"
        onClick={() => this.setState({ typeSelected: 'default', output: null })}
        disabled={this.state.typeSelected === 'default'}
      >
        Default JSON
      </Button>
      <Button
        size="small"
        onClick={() => this.setState({ typeSelected: 'browan', output: null })}
        disabled={this.state.typeSelected === 'browan'}
      >
        Browan JSON
      </Button>
      <Button
        size="small"
        onClick={() => this.setState({ typeSelected: 'cayenne', output: null })}
        disabled={this.state.typeSelected === 'cayenne'}
      >
        Cayenne JSON
      </Button>
    </span>
  )

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
                <QuestionCircleFilled style={{ fontSize: 20, color: 'grey', marginLeft: 8 }}/>
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
          bodyStyle={{ padding: 0 }}
        >
          <div className="no-scroll-bar" style={{ overflowX: 'scroll' }}>
          <div style={{ padding: 24, minWidth }}>
            {
              (this.state.typeSelected === 'default' || this.state.typeSelected === 'custom') && (
                <Card
                  title="JSON Message"
                  bodyStyle={{ padding: 0 }}
                  style={{ marginBottom: 16 }}
                  extra={this.renderJSONbuttons()}
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
                  extra={this.renderJSONbuttons()}
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
                  extra={this.renderJSONbuttons()}
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
                        <QuestionCircleFilled style={{ fontSize: 20, color: 'grey', marginLeft: 8 }}/>
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
                    this.state.typeSelected && (
                      <PlayCircleFilled style={{ color: '#38A2FF', fontSize: 22, marginRight: 0 }} onClick={this.generateOutput} />
                    )
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
          </div>
          </div>
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
                <QuestionCircleFilled style={{ fontSize: 20, color: 'grey', marginLeft: 8 }}/>
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
