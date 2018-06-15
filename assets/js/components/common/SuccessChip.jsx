import React, { Component } from 'react'
import SmallChip from './SmallChip';

class SuccessChip extends Component {
  render() {
    const { label } = this.props

    return (
      <SmallChip label={label} style={{backgroundColor: "#7CFC00"}} />
    )
  }
}

export default SuccessChip
