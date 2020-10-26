import React, { Component } from 'react'
import { codeEditorLineColor, codeEditorBgColor } from '../../util/colors'
import { Typography, Card } from 'antd';
const { Text } = Typography
import range from 'lodash/range'
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';

class ChannelPayloadTemplate extends Component {
  onClickEditor = () => {
    const editor = document.getElementsByClassName("npm__react-simple-code-editor__textarea")[0]
    editor.focus()
  }

  render() {
    return (
      <Card
        title="Advanced - Payload Template (Optional)"
        style={{ height: 560, overflow: 'hidden'}}
        bodyStyle={{ padding: 0 }}
        extra={this.props.extra}
      >
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
    )
  }
}

export default ChannelPayloadTemplate
