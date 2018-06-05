import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

@connect(mapStateToProps, {})
class Home extends Component {
  constructor(props) {
    super(props);

    this.renderLinks = this.renderLinks.bind(this)
  }

  renderLinks() {
    if (this.props.auth.isLoggedIn) {
      return (
        <div>
          <Link to="/profile">Profile</Link>
        </div>
      )
    } else {
      return (
        <div>
          <Link to="/login">Log in</Link>
          <Link to="/register">Register</Link>
        </div>
      )
    }
  }

  render() {
    return(
      <div>
        <h1>Home!</h1>
        {this.renderLinks()}
      </div>
    )
  }
};

function mapStateToProps(state) {
  return {
    auth: state.auth
  }
}

export default Home
