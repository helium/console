import React, { Component } from 'react'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import sample from 'lodash/sample'
import { createEvent } from '../../actions/event'
import { randomInt, randomFloat } from '../../util/random'

// MUI
import Button from 'material-ui/Button';

const descriptions = [
  "Received a packet",
  "Sent a packet",
  "Did a thing",
  "I'm an event",
]

class RandomEventButton extends Component {

  handleClick(e) {
    e.preventDefault()

    const { device_id, gateway_id, channel_id } = this.props

    this.props.createEvent({
      description: sample(descriptions),
      direction: sample(["inbound", "outbound"]),
      payload: "some payload",
      payload_size: randomInt(1, 100),
      rssi: randomFloat(1, 100).toFixed(2),
      status: sample(["success", "error"]),
      device_id,
      gateway_id,
      channel_id,
      reported_at: new Date().toISOString()
    })
  }

  render() {
    return (
      <Button
        size="small"
        color="primary"
        onClick={this.handleClick.bind(this)}
      >
        Random Event
      </Button>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createEvent }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(RandomEventButton);
