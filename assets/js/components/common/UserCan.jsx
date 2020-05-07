import React, { Component } from 'react';
import { connect } from 'react-redux';

@connect(mapStateToProps, null)
class UserCan extends Component {
  render() {
    if (userCan(this.props)) return this.props.children
    if (this.props.alternate) return this.props.alternate
    return null
  }
}

function mapStateToProps(state) {
  return {
    role: state.organization.currentRole
  }
}

export const userCan = (props) => {
  const { role } = props;
  if (role === 'read') return false
  return true
}

export default UserCan
