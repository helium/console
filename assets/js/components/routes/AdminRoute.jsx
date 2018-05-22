import React, { Component } from 'react';
import { Route, Redirect, withRouter } from 'react-router'
import { connect } from 'react-redux';

class AdminRoute extends Component {
  render() {
    const { isLoggedIn, isAdmin, path } = this.props
    const Component = this.props.component

    return(
      <Route path={path} render={(p) => {
        if (!isLoggedIn) {
          return <Redirect to='/login' />
        }

        if (!isAdmin) {
          return <Redirect to='/dashboard' />
        }

        return <Component {...p} />
      }} />
    )
  }
}

function mapStateToProps(state) {
  return {
    isLoggedIn: state.auth.isLoggedIn,
    isAdmin: state.user.role == "admin"
  }
}

export default withRouter(connect(mapStateToProps)(AdminRoute));
