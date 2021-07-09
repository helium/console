import React, { Component } from 'react'
import { Button, Typography } from 'antd';
import CopyOutlined from '@ant-design/icons/CopyOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';
import { CopyToClipboard } from 'react-copy-to-clipboard';
const { Text } = Typography

class WebhookKeyField extends Component {
  state = {
    display: false
  }

  render() {
    const { data } = this.props
    const { display } = this.state

    return(
      <span>
        {
          display ? (
            <EyeInvisibleOutlined onClick={() => this.setState({ display: false })} />
          ) : (
            <EyeOutlined onClick={() => this.setState({ display: true })} />
          )
        }
        { display ? <Text code style={{ marginRight: 10 }}>{data}</Text> : <Text code>************************</Text>}
        { display && <CopyToClipboard text={data}><Button style={{marginRight: 4}} size="small"><CopyOutlined /></Button></CopyToClipboard>}
      </span>
    )
  }
}


export default WebhookKeyField
