import React, { Component } from 'react';
import { Route, Redirect, withRouter } from 'react-router'
import { connect } from 'react-redux';

class PublicRoute extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { path } = this.props;
    const { isLoggedIn } = this.props.auth;
    const Component = this.props.component;

    return(
      <Route path={path} render={(p) => (
        isLoggedIn === false
          ? <Component {...p} />
        : <Redirect to='/secret' />
      )} />
    )
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth
  }
}

export default withRouter(connect(mapStateToProps)(PublicRoute));
