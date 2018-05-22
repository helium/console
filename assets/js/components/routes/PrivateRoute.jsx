import React, { Component } from 'react';
import { Route, Redirect, withRouter } from 'react-router'
import { connect } from 'react-redux';

class PrivateRoute extends Component {
  render() {
    const { path, isLoggedIn, currentTeamId, adminOnly, isAdmin } = this.props
    const Component = this.props.component

    return(
      <Route path={path} render={(p) => {
        if (!isLoggedIn) {
          return <Redirect to='/login' />
        }

        if (!currentTeamId && path !== '/teams/none') {
          return <Redirect to='/teams/none' />
        }

        if (currentTeamId && path === '/teams/none') {
          return <Redirect to='/devices' />
        }

        if (adminOnly && !isAdmin) {
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
    currentTeamId: state.auth.currentTeamId,
    isAdmin: state.user.role == "admin"
  }
}

export default withRouter(connect(mapStateToProps)(PrivateRoute));
