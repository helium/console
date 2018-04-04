import React, { Component } from 'react'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createChannel } from '../../actions/channel'
import { randomName, randomMac } from '../../util/random'

class RandomChannelButton extends Component {
  handleClick(e) {
    e.preventDefault()
    this.props.createChannel({
      name: randomName(),
      type: 'google',
      credentials: {
        some_api_key: "Secret!!"
      }
    })
  }

  render() {
    return (
      <a onClick={this.handleClick.bind(this)} className="btn btn-primary">
        Random Channel
      </a>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createChannel }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(RandomChannelButton);
