import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { enable2fa, getNew2fa, clear2faBackupCodes, skip2fa } from '../../actions/auth.js';
import { withRouter } from 'react-router'
import QRCode from 'qrcode.react';
import AuthLayout from '../common/AuthLayout'

// MUI
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  title: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit,
  },
  instructions: {
    marginBottom: theme.spacing.unit,
  },
  input: {
    marginBottom: theme.spacing.unit * 2,
  },
  qrCode: {
    textAlign: 'center',
    marginBottom: theme.spacing.unit * 2,
    marginTop: theme.spacing.unit * 2,
  },
  backupCodes: {
    display: 'flex',
    flexWrap: 'wrap',
    listStyle: 'none',
    border: '1px solid #efefef',
    borderRadius: 6,
    padding: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
  },
  backupCode: {
    width: '50%',
    textAlign: 'center',
    fontFamily: '"Courier New", Courier, monospace',
  }
})

@withRouter
@withStyles(styles)
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
    this.props.enable2fa(this.state.twoFactorCode, user.id, user.secret2fa)
  }

  handleSkip() {
    const { user } = this.props.auth
    this.props.skip2fa(user.id)
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
    const { classes } = this.props

    return(
      <AuthLayout>
        <Card>
          <CardContent>
            <Typography variant="headline" className={classes.title}>
              Set up multi-factor auth
            </Typography>
            <Typography component="p" className={classes.instructions}>
              Set up multi-factor authentication by scanning the QR code below, we highly recommend it.
            </Typography>

            <div className={classes.qrCode}>
              {this.renderQRCode()}
            </div>

            <form onSubmit={this.handleSubmit}>
              <TextField
                label="2FA Code"
                name="twoFactorCode"
                value={this.state.twoFactorCode}
                onChange={this.handleInputUpdate}
                className={classes.input}
                fullWidth
              />

              <Button
                type="submit"
                variant="raised"
                color="primary"
                size="large"
              >
                Enable 2FA
              </Button>
              <Button
                onClick={this.handleSkip}
                size="large"
                style={{marginLeft: 16}}
              >
                Skip for now
              </Button>
            </form>
          </CardContent>
        </Card>
      </AuthLayout>
    )
  }

  renderBackupCodes() {
    const { user } = this.props.auth
    const { classes } = this.props

    return(
      <AuthLayout>
        <Card>
          <CardContent>
            <Typography variant="headline" className={classes.title}>
              Copy backup codes
            </Typography>
            <Typography component="p" className={classes.instructions}>
              These are your backup codes. You can use them in place of a 2FA code when signing in. This is the last time they will be displayed!
            </Typography>

            <Typography component="ul" className={classes.backupCodes}>
            { user.backup_codes.map(code =>
              <li key={code} className={classes.backupCode}>{code}</li>
            )}
            </Typography>

              <Button
                onClick={this.handleContinue}
                variant="raised"
                color="primary"
                size="large"
              >
                I've copied my backup codes
              </Button>
          </CardContent>
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
