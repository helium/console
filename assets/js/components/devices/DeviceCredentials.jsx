import React, { Component } from 'react'
import { Button, Tag, Typography } from 'antd';
import ArrowsAltOutlined from '@ant-design/icons/ArrowsAltOutlined';
import CopyOutlined from '@ant-design/icons/CopyOutlined';
import SwapOutlined from '@ant-design/icons/SwapOutlined';
import { CopyToClipboard } from 'react-copy-to-clipboard';
const { Text } = Typography

class DeviceCredentials extends Component {
  state = {
    display: 'default'
  }

  toggleDefault = () => {
    const { display } = this.state
    this.setState({ display: display === 'default' ? 'msb' : 'default' })
  }

  toggleType = () => {
    const { display } = this.state
    this.setState({ display: display === 'msb' ? 'lsb' : 'msb' })
  }

  render() {
    const { data } = this.props
    const { display } = this.state

    const formattedData = data.toUpperCase()
    const msb = chunkArray(formattedData.split(''), 2).map(chunk => `0x${chunk.join('')}`).join(', ')
    const lsb = chunkArray(formattedData.split(''), 2).reverse().map(chunk => `0x${chunk.join('')}`).join(', ')

    return(
      <span>
        <Button color={display !== 'default' ? 'blue' : ''} size="small" style={{ marginRight: 5 }} onClick={this.toggleDefault}><ArrowsAltOutlined /></Button>

        { display !== 'default' && <Button size="small"  onClick={this.toggleType}><SwapOutlined /></Button> }
        { display !== 'default' && <p style={{display: 'inline-block',margin: 0, marginRight: 5 }}>{display}:</p> }
        { display == 'default' && <Text code style={{ marginRight: 5 }}>{formattedData}</Text>}
        { display == 'default' && <CopyToClipboard text={formattedData}><Button style={{marginRight: 4}} size="small"><CopyOutlined /></Button></CopyToClipboard>}

        { display == 'msb' &&  <Text code style={{ marginRight: 5 }}>{msb}</Text> }
        { display == 'msb' &&  <CopyToClipboard text={msb}><Tag><CopyOutlined /></Tag></CopyToClipboard> }

        { display == 'lsb' &&  <Text code style={{ marginRight: 5 }}>{lsb}</Text> }
        { display == 'lsb' &&  <CopyToClipboard text={lsb}><Tag><CopyOutlined /></Tag></CopyToClipboard> }

      </span>
    )
  }
}

const chunkArray = (array, chunkSize) => {
  return Array.from({ length: Math.ceil(array.length / chunkSize) }, (_, index) =>
    array.slice(index * chunkSize, (index + 1) * chunkSize)
  )
}

export default DeviceCredentials
