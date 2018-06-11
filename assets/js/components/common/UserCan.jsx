import React, { Component } from 'react';
import { connect } from 'react-redux';

@connect(mapStateToProps, null)
class UserCan extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    if (userCan(this.props)) return this.props.children
    return null
  }
}

function mapStateToProps(state) {
  return {
    user: state.user
  }
}

export const userCan = (props) => {
  const { user, action, itemType, item } = props
  const { email, role } = user

  if (itemType === 'membership' && item && email === item.email) return false
  if (itemType === 'auditTrails' && role !== 'admin') return false

  if (role === 'admin') return true
  if (role === 'developer') return true
  if (role === 'analyst') return true

  return false
}

export default UserCan
