import React, { Component } from 'react'
import { Button, Icon, Tag } from 'antd';
import { CopyToClipboard } from 'react-copy-to-clipboard';

class DeviceCredentials extends Component {
    constructor(props) {
      super(props)

      this.state = {
        display: 'default'
      }

      this.toggleDefault = this.toggleDefault.bind(this)
      this.toggleType = this.toggleType.bind(this)
    }

    toggleDefault() {
      const { display } = this.state
      this.setState({ display: display === 'default' ? 'msb' : 'default' })
    }

    toggleType() {
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
          <Tag color={display !== 'default' ? 'blue' : ''} onClick={this.toggleDefault}><Icon type="arrows-alt" /></Tag>

          { display !== 'default' && <Tag color="green" onClick={this.toggleType}><Icon type="swap" /></Tag> }
          { display !== 'default' && <Tag>{display}</Tag> }
          { display == 'default' && <span style={{ marginRight: 7 }}>{formattedData}</span>}
          { display == 'default' && <CopyToClipboard text={formattedData}><Tag><Icon type="copy" /></Tag></CopyToClipboard>}

          { display == 'msb' &&  <span style={{ marginRight: 7 }}>{msb}</span> }
          { display == 'msb' &&  <CopyToClipboard text={msb}><Tag><Icon type="copy" /></Tag></CopyToClipboard> }

          { display == 'lsb' &&  <span style={{ marginRight: 7 }}>{lsb}</span> }
          { display == 'lsb' &&  <CopyToClipboard text={lsb}><Tag><Icon type="copy" /></Tag></CopyToClipboard> }

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
