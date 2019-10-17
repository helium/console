import React, { Component } from 'react'

import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';

class NewDeviceButton extends Component {
  handleClick(e) {
    e.preventDefault()
    this.props.handleClick()
  }

  render() {
    return (
      <Button
        variant="fab"
        color="secondary"
        onClick={this.handleClick.bind(this)}
        style={{position: 'fixed', right: 30, bottom: 30}} >
        <AddIcon />
      </Button>
    )
  }
}

export default NewDeviceButton
