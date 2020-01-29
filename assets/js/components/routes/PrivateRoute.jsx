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
