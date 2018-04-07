import React, { Component } from 'react'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import sample from 'lodash/sample'
import { createChannel } from '../../actions/channel'
import { randomName, randomMac } from '../../util/random'
import Button from 'material-ui/Button';
import AddIcon from 'material-ui-icons/Add';

class RandomChannelButton extends Component {
  handleClick(e) {
    e.preventDefault()
    this.props.createChannel({
      name: randomName(),
      type: sample(['google', 'aws', 'azure', 'http', 'mqtt']),
      credentials: {
        some_api_key: "Secret!!"
      }
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
  return bindActionCreators({ createChannel }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(RandomChannelButton);
