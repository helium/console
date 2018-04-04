import React, { Component } from 'react'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { deleteDevice } from '../../actions/device'

class DeleteDeviceButton extends Component {
  handleClick(e) {
    e.preventDefault()
    const { device } = this.props
    this.props.deleteDevice(device)
  }

  render() {
    return (
      <a onClick={this.handleClick.bind(this)} className="btn btn-danger">
        Delete Device
      </a>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ deleteDevice }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(DeleteDeviceButton);
