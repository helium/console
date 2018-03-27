import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { fetchUser } from '../actions/user.js';
import { logOut } from '../actions/auth.js';
import QRCode from 'qrcode.react';

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
        <Link to="/events">Events</Link>
        <button onClick={this.handleLogout}>Log Out</button>
        <QRCode value="otpauth://totp/BEAMCoin?secret=GDJWVBSGXAC36OBQ&issuer=Helium%20Inc" />
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
