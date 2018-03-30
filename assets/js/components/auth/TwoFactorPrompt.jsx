import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { logIn, enable2fa } from '../../actions/auth.js';
import QRCode from 'qrcode.react';

class TwoFactorPrompt extends Component {
  constructor(props) {
    super(props);

    this.state = {
      twoFactorCode: ""
    };

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleSkip = this.handleSkip.bind(this)
    this.handleInputUpdate = this.handleInputUpdate.bind(this)
  }

  handleSubmit(e) {
    e.preventDefault()
    const { user } = this.props.auth

    this.props.enable2fa(this.state.twoFactorCode, user.id, user.secret2fa)
  }

  handleSkip() {
    
  }

  handleInputUpdate(e) {
    this.setState({ twoFactorCode: e.target.value})
  }

  render() {
    const { user } = this.props.auth
    const secret2fa = "otpauth://totp/BEAMCoin?secret=" + user.secret2fa + "&issuer=Helium%20Inc"
    return(
      <div>
        <p>Set up multi-factor authentication by scanning the QR code below, we highly recommend it.</p>
        <QRCode value={secret2fa} />
        <form onSubmit={this.handleSubmit}>
          <label>2FA Code</label>
          <input name ="twoFactorCode" value={this.state.twoFactorCode} onChange={this.handleInputUpdate} />
          <button type="submit">Submit</button>
        </form>
        <button onClick={this.handleSkip}>Skip</button>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ logIn, enable2fa, dispatch }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(TwoFactorPrompt);
