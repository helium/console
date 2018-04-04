import React, { Component } from 'react'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createDevice } from '../../actions/device'
import { randomName, randomMac } from '../../util/random'

class RandomDeviceButton extends Component {
  handleClick(e) {
    e.preventDefault()
    this.props.createDevice(randomName(), randomMac())
  }

  render() {
    return (
      <a onClick={this.handleClick.bind(this)} className="btn btn-primary">
        Random Device
      </a>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createDevice }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(RandomDeviceButton);
