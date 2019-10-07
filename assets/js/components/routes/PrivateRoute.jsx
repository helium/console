import React, { Component } from 'react';
import { Route, Redirect, withRouter } from 'react-router'
import { connect } from 'react-redux';

class PrivateRoute extends Component {
  render() {
    const { path, isLoggedIn, currentOrganizationId } = this.props
    const Component = this.props.component

    return(
      <Route path={path} render={(p) => {
        if (!isLoggedIn) {
          return <Redirect to='/login' />
        }

        if (!currentOrganizationId && path !== '/teams/none') {
          return <Redirect to='/teams/none' />
        }

        if (currentOrganizationId && path === '/teams/none') {
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
    currentOrganizationId: state.auth.currentOrganizationId
  }
}

export default withRouter(connect(mapStateToProps)(PrivateRoute));
