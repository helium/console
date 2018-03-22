import React, { Component } from 'react';
import { Route, Redirect, withRouter } from 'react-router'
import { connect } from 'react-redux';

class PrivateRoute extends Component {
  render() {
    const { path } = this.props;
    const { isLoggedIn } = this.props.auth;
    const Component = this.props.component;

    return(
      <Route path={path} render={(p) => (
        isLoggedIn === true
          ? <Component {...p} />
          : <Redirect to='/login' />
      )} />
    )
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth
  }
}

export default withRouter(connect(mapStateToProps)(PrivateRoute));
