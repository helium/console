import React, { Component } from 'react'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createGateway } from '../../actions/gateway'
import { randomName, randomMac, randomLatitude, randomLongitude } from '../../util/random'
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';

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
      <Button
        variant="fab"
        color="secondary"
        onClick={this.handleClick.bind(this)}
        style={{position: 'fixed', right: 30, bottom: 30, zIndex: 2}} >
        <AddIcon />
      </Button>
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
