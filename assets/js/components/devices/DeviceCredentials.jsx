import React, { Component } from 'react'
import { Button, Icon, Tag } from 'antd';

function chunkArray(array, chunkSize) {
    return Array.from({ length: Math.ceil(array.length / chunkSize) }, (_, index) =>
        array.slice(index * chunkSize, (index + 1) * chunkSize),
    )
}
  
function selectText(node) {
    if (document.body.createTextRange) {
        const range = document.body.createTextRange()
        range.moveToElementText(node)
        range.select()
    } else if (window.getSelection) {
        const selection = window.getSelection()
        const range = document.createRange()
        range.selectNodeContents(node)
        selection.removeAllRanges()
        selection.addRange(range)
    }
}

class DeviceCredentials extends Component {
    constructor(props) {
      super(props)

      this.state = {
        hidden: false,
        byteStyle: true,
        copied: false,
        msb: true,
        truncated: false,
      }
    }

    handleTransformToggle() {
        this.setState(prev => ({ byteStyle: !prev.byteStyle }))
        //this.checkTruncateState()
    }
    
    handleSwapToggle() {
        this.setState(prev => ({ msb: !prev.msb }))
    }

    checkTruncateState() {
        if (!this.containerElem.current) {
          return
        }
    
        const containerWidth = this.containerElem.current.offsetWidth
        const buttonsWidth = this.buttonsElem.current.offsetWidth
        const displayWidth = this.displayElem.current.offsetWidth
        const netContainerWidth = containerWidth - buttonsWidth - 14
        if (netContainerWidth < displayWidth && !this.state.truncated) {
          this.setState({ truncated: true })
        } else if (netContainerWidth > displayWidth && this.state.truncated) {
          this.setState({ truncated: false })
        }
    }

    render() {
        const { hidden, byteStyle, msb, copied, copyIcon } = this.state

        const { data, isBytes, hideable, noCopyPopup } = this.props
    
        let formattedData = isBytes ? data.toUpperCase() : data
        let display = formattedData

        if (isBytes) {
            const chunks = chunkArray(data.toUpperCase().split(''), 2)
            if (!byteStyle) {
                const orderedChunks = msb ? chunks : chunks.reverse()
                formattedData = display = orderedChunks.map(chunk => `0x${chunk.join('')}`).join(', ')
            } else {
                display = chunks.map((chunk, index) => (
                <span key={`${data}_chunk_${index}`}>{hidden ? '••' : chunk}</span>
            ))
            }
        } else if (hidden) {
            display = '•'.repeat(formattedData.length)
        }

        return(
            <span>
                {isBytes && (
                    <Tag
                        color="cyan"
                        onClick={() => this.handleTransformToggle()}
                    >
                        <Icon type="arrows-alt" />
                    </Tag>
                )}                
                {!byteStyle && isBytes && (
                    <React.Fragment>
                        <Tag color="red">{msb ? 'msb' : 'lsb'}</Tag>
                        <Tag
                            color="cyan"
                            onClick={() => this.handleSwapToggle()}
                        >
                            <Icon type="swap" />
                        </Tag>
                    </React.Fragment>
                )}
                {display}
                
            </span>
        )
    }
}

export default DeviceCredentials
