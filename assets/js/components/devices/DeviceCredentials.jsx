import React, { Component } from 'react'
import { Button, Icon, Tag } from 'antd';

class DeviceCredentials extends Component {
    constructor(props) {
      super(props)

      this.state = {
        display: 'default'
      }
    }

    updateDisplay(display) {
      this.setState({ display })
    }

    render() {
      const { data } = this.props
      const { display } = this.state

      const formattedData = data.toUpperCase()
      const msb = chunkArray(formattedData.split(''), 2)
      const lsb = chunkArray(formattedData.split(''), 2).reverse()

      return(
        <span>
          <Tag color={display == 'default' ? 'blue' : ''} onClick={() => this.updateDisplay('default')}>default</Tag>
          <Tag color={display == 'msb' ? 'blue' : ''} onClick={() => this.updateDisplay('msb')}>msb</Tag>
          <Tag color={display == 'lsb' ? 'blue' : ''} onClick={() => this.updateDisplay('lsb')}>lsb</Tag>
          <br />
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
