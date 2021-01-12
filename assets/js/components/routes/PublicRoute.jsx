import React, { Component } from 'react';
import { Route } from 'react-router'

class PublicRoute extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { path, loaded } = this.props;
    const Component = this.props.component;

    return(
      <Route path={path} render={props => (
        <Component {...props} loaded={loaded} />
      )} />
    )
  }
}

export default PublicRoute;
