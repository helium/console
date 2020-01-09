import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { enable2fa, getNew2fa, clear2faBackupCodes, skip2fa } from '../../actions/auth.js';
import { withRouter } from 'react-router'
import QRCode from 'qrcode.react';
import AuthLayout from '../common/AuthLayout'
import analyticsLogger from '../../util/analyticsLogger'
import { Typography, Button, Input, Form } from 'antd';
const { Text } = Typography

@withRouter
@connect(mapStateToProps, mapDispatchToProps)
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
    if (user.twoFactorEnabled) return this.props.history.replace("/devices")

    this.props.getNew2fa()
  }

  componentWillUnmount() {
    const { user } = this.props.auth
    if (user.backup_codes) this.props.clear2faBackupCodes()
  }

  handleSubmit(e) {
    e.preventDefault()
    const { user } = this.props.auth
    analyticsLogger.logEvent("ACTION_ENABLE_2FA", { "id": user.id })
    this.props.enable2fa(this.state.twoFactorCode, user.id, user.secret2fa)
  }

  handleSkip() {
    const { user } = this.props.auth
    this.props.skip2fa(user.id)
    analyticsLogger.logEvent("ACTION_SKIP_2FA", { "id": user.id})
    this.props.history.replace("/dashboard")
  }

  handleContinue() {
    this.props.history.replace("/dashboard")
  }

  handleInputUpdate(e) {
    this.setState({ twoFactorCode: e.target.value})
  }

  renderQRCode() {
    const { user } = this.props.auth
    if (user.secret2fa) {
      const secret2fa = "otpauth://totp/Helium%20Console?secret=" + user.secret2fa + "&issuer=Helium%20Inc"
      return <QRCode value={secret2fa} />
    }
  }

  renderForm() {
    return(
      <AuthLayout>
        <Text strong>
          Set up multi-factor auth
        </Text>
        <br />
        <Text>
          Set up multi-factor authentication by scanning the QR code below, we highly recommend it.
        </Text>

        <div>
          {this.renderQRCode()}
        </div>

        <Form onSubmit={this.handleSubmit}>
          <Form.Item>
            <Input
              placeholder="2FA Code"
              name="twoFactorCode"
              value={this.state.twoFactorCode}
              onChange={this.handleInputUpdate}
            />
          </Form.Item>

          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button type="primary" htmlType="submit">
              Enable 2FA
            </Button>

            <Button onClick={this.handleSkip}>
              Skip for now
            </Button>
          </div>
        </Form>
      </AuthLayout>
    )
  }

  renderBackupCodes() {
    const { user } = this.props.auth

    return(
      <AuthLayout>
        <Text strong>
          Copy backup codes
        </Text>
        <br />
        <Text>
          These are your backup codes. You can use them in place of a 2FA code when signing in. This is the last time they will be displayed!
        </Text>
        <br />
        { user.backup_codes.map(code =>
          <span key={code}>
            <Text>{code}</Text><br />
          </span>
        )}

        <Button
          onClick={this.handleContinue}
          type="primary"
        >
          I've copied my backup codes
        </Button>
      </AuthLayout>
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

export default TwoFactorPrompt
