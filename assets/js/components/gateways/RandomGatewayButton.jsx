import React, { Component } from 'react'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createGateway } from '../../actions/gateway'
import { randomName, randomMac, randomLatitude, randomLongitude } from '../../util/random'

class RandomGatewayButton extends Component {
  handleClick(e) {
    e.preventDefault()
    this.props.createGateway({
      name: randomName(),
      mac: randomMac(),
      public_key: "some public key",
      latitude: randomLatitude(),
      longitude: randomLongitude()
    })
  }

  render() {
    return (
      <a onClick={this.handleClick.bind(this)} className="btn btn-primary">
        Random Gateway
      </a>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createGateway }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(RandomGatewayButton);
