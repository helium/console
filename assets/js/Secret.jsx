import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { fetchUser } from './actions/user.js';
import { logOut } from './actions/auth.js';

class Secret extends Component {
  constructor(props) {
    super(props);

    this.handleLogout = this.handleLogout.bind(this);
  }

  componentDidMount() {
    this.props.fetchUser();
  }

  handleLogout() {
    this.props.logOut()
  }

  render() {
    const { email } = this.props.user;

    return(
      <div>
        <h2>Secret!</h2>
        <p>Your email is: {email}</p>
        <Link to="/">Home</Link>
        <button onClick={this.handleLogout}>Log Out</button>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.user
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ logOut, fetchUser }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Secret);
