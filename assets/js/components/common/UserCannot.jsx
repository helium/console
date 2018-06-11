import React, { Component } from 'react';
import { connect } from 'react-redux';
import UserCan, { userCan } from './UserCan'

@connect(mapStateToProps, null)
class UserCannot extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    if (!userCan(this.props)) return this.props.children
    return null
  }
}

function mapStateToProps(state) {
  return {
    user: state.user
  }
}

export default UserCannot
