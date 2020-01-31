import React, { Component } from 'react'
import { Button, Icon, Tag } from 'antd';

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
      const msb = chunkArray(formattedData.split(''), 2)
      const lsb = chunkArray(formattedData.split(''), 2).reverse()

      return(
        <span>
          <Tag color={display !== 'default' ? 'blue' : ''} onClick={this.toggleDefault}><Icon type="arrows-alt" /></Tag>

          { display !== 'default' && <Tag color="green" onClick={this.toggleType}><Icon type="swap" /></Tag> }
          { display !== 'default' && <Tag>{display}</Tag> }
          { display == 'default' && <span>{data.toUpperCase()}</span>}
          { display == 'msb' &&  <span>{msb.map(chunk => `0x${chunk.join('')}`).join(', ')}</span> }
          { display == 'lsb' &&  <span>{lsb.map(chunk => `0x${chunk.join('')}`).join(', ')}</span> }
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
