import React, { Component } from 'react'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createDevice } from '../../actions/device'
import { randomName, randomMac } from '../../util/random'
import Button from 'material-ui/Button';
import AddIcon from 'material-ui-icons/Add';

class RandomDeviceButton extends Component {
  handleClick(e) {
    e.preventDefault()
    this.props.createDevice({
      name: randomName(),
      mac: randomMac(),
      public_key: "some public key"
    })
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

function mapStateToProps(state, ownProps) {
  return {
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createDevice }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(RandomDeviceButton);
