import React, { Component } from 'react';
import { connect } from 'react-redux';

@connect(mapStateToProps, null)
class UserCan extends Component {
  constructor(props) {
    super(props)
    this.userCan = this.userCan.bind(this)
  }

  userCan() {
    const { user, action, itemType, item } = this.props
    const { email, role } = user

    if (itemType === 'membership' && item && email === item.email) return false
    if (itemType === 'auditTrails' && role !== 'admin') return false

    if (role === 'admin') return true
    if (role === 'developer') return true
    if (role === 'analyst') return true

    return false
  }

  render() {
    if (this.userCan()) return this.props.children
    return null
  }
}

function mapStateToProps(state) {
  return {
    user: state.user
  }
}

export default UserCan
