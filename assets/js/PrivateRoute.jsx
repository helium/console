import React, { Component } from 'react';
import { Route, Redirect, withRouter } from 'react-router'
import { connect } from 'react-redux';
// import socket from './socket';

class PrivateRoute extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    // do websocket stuff here...
    // let channel = socket.channel("event:all", {})
    // channel.join()
    //   .receive("ok", resp => { console.log("Joined successfully", resp) })
    //   .receive("error", resp => { console.log("Unable to join", resp) })
  }

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
