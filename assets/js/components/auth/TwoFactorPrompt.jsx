import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { enable2fa, getNew2fa, clear2faBackupCodes, skip2fa } from '../../actions/auth.js';
import { withRouter } from 'react-router'
import QRCode from 'qrcode.react';

class TwoFactorPrompt extends Component {
  constructor(props) {
    super(props);

    this.state = {
      twoFactorCode: ""
    };

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleSkip = this.handleSkip.bind(this)
    this.handleContinue = this.handleContinue.bind(this)
    this.handleInputUpdate = this.handleInputUpdate.bind(this)
    this.renderQRCode = this.renderQRCode.bind(this)
    this.renderForm = this.renderForm.bind(this)
    this.renderBackupCodes = this.renderBackupCodes.bind(this)
  }

  componentDidMount() {
    const { user } = this.props.auth
    if (user.twoFactorEnabled) return this.props.history.replace("/secret")

    this.props.getNew2fa()
  }

  componentWillUnmount() {
    const { user } = this.props.auth
    if (user.backup_codes) this.props.clear2faBackupCodes()
  }

  handleSubmit(e) {
    e.preventDefault()
    const { user } = this.props.auth
    this.props.enable2fa(this.state.twoFactorCode, user.id, user.secret2fa)
  }

  handleSkip() {
    const { user } = this.props.auth
    this.props.skip2fa(user.id)
    this.props.history.replace("/secret")
  }

  handleContinue() {
    this.props.history.replace("/secret")
  }

  handleInputUpdate(e) {
    this.setState({ twoFactorCode: e.target.value})
  }

  renderQRCode() {
    const { user } = this.props.auth
    if (user.secret2fa) {
      const secret2fa = "otpauth://totp/BEAMCoin?secret=" + user.secret2fa + "&issuer=Helium%20Inc"
      return <QRCode value={secret2fa} />
    }
  }

  renderForm() {
    return(
      <div>
        <p>Set up multi-factor authentication by scanning the QR code below, we highly recommend it.</p>
        {this.renderQRCode()}
        <form onSubmit={this.handleSubmit}>
          <label>2FA Code</label>
          <input name ="twoFactorCode" value={this.state.twoFactorCode} onChange={this.handleInputUpdate} />
          <button type="submit">Submit</button>
        </form>
        <button onClick={this.handleSkip}>Skip</button>
      </div>
    )
  }

  renderBackupCodes() {
    const { user } = this.props.auth
    return(
      <div>
        { user.backup_codes.map(code => <p key={code}>{code}</p> )}
        <button onClick={this.handleContinue}>Continue</button>
      </div>
    )
  }

  render() {
    const { user } = this.props.auth
    return user.backup_codes ? this.renderBackupCodes() : this.renderForm()
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ enable2fa, getNew2fa, clear2faBackupCodes, skip2fa }, dispatch);
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TwoFactorPrompt));
