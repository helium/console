import React, { Component } from 'react'
import { Button, Tag, Typography } from 'antd';
import { ArrowsAltOutlined, CopyOutlined, SwapOutlined } from '@ant-design/icons';
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
        <Button color={display !== 'default' ? 'blue' : ''} size="small" style={{ marginRight: 10 }} onClick={this.toggleDefault}><ArrowsAltOutlined /></Button>

        { display !== 'default' && <Button size="small"  onClick={this.toggleType}><SwapOutlined /></Button> }
        { display !== 'default' && <p style={{display: 'inline-block',margin: 0, marginRight: 5 }}>{display}:</p> }
        { display == 'default' && <Text code style={{ marginRight: 10 }}>{formattedData}</Text>}
        { display == 'default' && <CopyToClipboard text={formattedData}><Button style={{marginRight: 4}} size="small"><CopyOutlined /></Button></CopyToClipboard>}

        { display == 'msb' &&  <Text code style={{ marginRight: 10 }}>{msb}</Text> }
        { display == 'msb' &&  <CopyToClipboard text={msb}><Tag><CopyOutlined /></Tag></CopyToClipboard> }

        { display == 'lsb' &&  <Text code style={{ marginRight: 10 }}>{lsb}</Text> }
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
