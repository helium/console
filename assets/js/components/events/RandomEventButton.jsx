import React, { Component } from 'react'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createEvent } from '../../actions/event'
// import { randomName, randomMac } from '../../util/random'

class RandomEventButton extends Component {

  handleClick(e) {
    e.preventDefault()

    const { device_id, gateway_id, channel_id } = this.props

    this.props.createEvent({
      description: "New event",
      direction: "inbound",
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
