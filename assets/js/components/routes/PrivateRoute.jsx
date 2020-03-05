import React, { Component } from 'react';
import { Route, Redirect, withRouter } from 'react-router'
import { connect } from 'react-redux';
import NoOrganization from '../dashboard/NoOrganization'

class PrivateRoute extends Component {
  render() {
    const { path, isLoggedIn, currentOrganizationId } = this.props
    const Component = this.props.component

    return(
      <Route path={path} render={props => {
        if (!isLoggedIn) {
          return <Redirect to='/login' />
        }

        if (!currentOrganizationId) {
          return <NoOrganization />
        }

        return <Component {...props} />
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
