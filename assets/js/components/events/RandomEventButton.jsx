import React, { Component } from 'react'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import sample from 'lodash/sample'
import { createEvent } from '../../actions/event'
import { randomInt, randomFloat } from '../../util/random'

class RandomEventButton extends Component {

  handleClick(e) {
    e.preventDefault()

    const { device_id, gateway_id, channel_id } = this.props

    this.props.createEvent({
      description: "New event",
      direction: sample(["inbound", "outbound"]),
      payload: "some payload",
      payload_size: randomInt(1, 100),
      rssi: randomFloat(1, 100).toFixed(2),
      device_id,
      gateway_id,
      channel_id
    })
  }

  render() {
    return (
      <a onClick={this.handleClick.bind(this)} className="btn btn-primary">
        Random Event
      </a>
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
