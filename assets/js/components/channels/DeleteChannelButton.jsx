import React, { Component } from 'react'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { deleteChannel } from '../../actions/channel'

class DeleteChannelButton extends Component {
  handleClick(e) {
    e.preventDefault()
    const { channel } = this.props
    this.props.deleteChannel(channel)
  }

  render() {
    return (
      <a onClick={this.handleClick.bind(this)} className="btn btn-danger">
        Delete Channel
      </a>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ deleteChannel }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(DeleteChannelButton);
