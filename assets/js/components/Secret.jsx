import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { fetchUser } from '../actions/user.js';
import { logOut } from '../actions/auth.js';
import QRCode from 'qrcode.react';
import DashboardLayout from './DashboardLayout'

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
      <DashboardLayout title="Profile">
        <p>Your email is: {email}</p>
        <button onClick={this.handleLogout}>Log Out</button>
        <QRCode value="otpauth://totp/BEAMCoin?secret=GDJWVBSGXAC36OBQ&issuer=Helium%20Inc" />
      </DashboardLayout>
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
