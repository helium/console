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
  const { user, itemType, item } = props
  const { email, role } = user

  if (itemType === 'membership' && item && email === item.email) return false
  if (itemType === 'channel' && role === 'manager') return true
  if (itemType === 'team' && role === 'manager') return true
  if (role === 'admin') return true

  return false
}

export default UserCan
