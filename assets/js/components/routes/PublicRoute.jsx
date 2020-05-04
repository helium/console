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
    const hideWelcomeScreen = localStorage.getItem('hideWelcomeScreen')

    return(
      <Route path={path} render={props => (
        isLoggedIn === false
          ? <Component {...props} />
        : <Redirect to={hideWelcomeScreen ? '/devices' : '/welcome'} />
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
