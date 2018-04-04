import React, { Component } from 'react'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { deleteGateway } from '../../actions/gateway'

class DeleteGatewayButton extends Component {
  handleClick(e) {
    e.preventDefault()
    this.props.deleteGateway(this.props.gateway)
  }

  render() {
    return (
      <a onClick={this.handleClick.bind(this)} className="btn btn-danger">
        Delete Gateway
      </a>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ deleteGateway }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(DeleteGatewayButton);
