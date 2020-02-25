import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { enable2fa, getNew2fa, clear2faBackupCodes, skip2fa } from '../../actions/auth.js';
import { withRouter } from 'react-router'
import QRCode from 'qrcode.react';
import AuthLayout from '../common/AuthLayout'
import Logo from '../../../img/symbol.svg'
import analyticsLogger from '../../util/analyticsLogger'
import { Typography, Button, Input, Form, Card, Icon, Row, Col } from 'antd';
const { Text, Title } = Typography

@withRouter
@connect(mapStateToProps, mapDispatchToProps)
class TwoFactorPrompt extends Component {
  state = {
    twoFactorCode: ""
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

  handleSubmit = (e) => {
    e.preventDefault()
    const { user } = this.props.auth
    analyticsLogger.logEvent("ACTION_ENABLE_2FA", { "id": user.id })
    this.props.enable2fa(this.state.twoFactorCode, user.id, user.secret2fa)
  }

  handleSkip = () => {
    const { user } = this.props.auth
    this.props.skip2fa(user.id)
    analyticsLogger.logEvent("ACTION_SKIP_2FA", { "id": user.id})
    this.props.history.replace("/dashboard")
  }

  handleContinue = () => {
    this.props.history.replace("/dashboard")
  }

  handleInputUpdate = (e) => {
    this.setState({ twoFactorCode: e.target.value})
  }

  renderQRCode = () => {
    const { user } = this.props.auth
    if (user.secret2fa) {
      const secret2fa = "otpauth://totp/Helium%20Console?secret=" + user.secret2fa + "&issuer=Helium%20Inc"
      return <QRCode value={secret2fa} />
    }
  }

  renderForm = () => {
    return(
      <AuthLayout>
        <Card style={{padding: 30, borderRadius: 20, boxShadow: '0 52px 64px -50px #001529'}}>
          <img src={Logo} style={{width: 70, display: "block", margin:'0 auto', marginBottom: 20}} />
          <div style={{textAlign: 'center', marginBottom: 30}}>
            <Title>
              Helium Console
            </Title>
            <Text style={{color:'#38A2FF'}}>Set up multi-factor authentication by scanning the QR code below, we highly recommend it.</Text>
          </div>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: 30 }}>
            {this.renderQRCode()}
          </div>

          <Form onSubmit={this.handleSubmit}>
            <Form.Item>
              <Input
                placeholder="2FA Code"
                name="twoFactorCode"
                value={this.state.twoFactorCode}
                onChange={this.handleInputUpdate}
                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
              />
            </Form.Item>

            <Row gutter={16} style={{marginTop: 20}}>
              <Col sm={12}>
              <Button type="primary" htmlType="submit" style={{width: '100%'}}>
                Enable 2FA
              </Button>
              </Col>
              <Col sm={12}>
              <Button onClick={this.handleSkip} style={{width: '100%'}}>
                Skip for now
              </Button>
              </Col>
            </Row>
          </Form>
        </Card>
      </AuthLayout>
    )
  }

  renderBackupCodes = () => {
    const { user } = this.props.auth

    return(
      <AuthLayout>
        <Card style={{padding: 30, borderRadius: 20, boxShadow: '0 52px 64px -50px #001529'}}>
          <img src={Logo} style={{width: 70, display: "block", margin:'0 auto', marginBottom: 20}} />
          <div style={{textAlign: 'center', marginBottom: 30}}>
            <Title>
              Helium Console
            </Title>
            <Text style={{color:'#38A2FF'}}>Copy backup codes</Text>
          </div>
          <div style={{ marginBottom: 20 }}>
            <Text>
              These are your backup codes. You can use them in place of a 2FA code when signing in. This is the last time they will be displayed!
            </Text>
          </div>
          { user.backup_codes.map(code =>
            <span key={code}>
              <Text>{code}</Text><br />
            </span>
          )}

          <Row gutter={16} style={{marginTop: 20}}>
            <Button type="primary" onClick={this.handleContinue} style={{width: '100%'}}>
              I've copied my backup codes
            </Button>
          </Row>
        </Card>
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
