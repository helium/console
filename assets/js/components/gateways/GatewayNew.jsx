import React, { Component } from 'react'
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import DashboardLayout from '../common/DashboardLayout'
import QRCode from 'qrcode.react';

//MUI
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  status: {
    marginTop: theme.spacing.unit * 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  icon: {
    height: 100,
    width: 100,
    backgroundSize: 'cover',
    marginBottom: theme.spacing.unit * 2,
  }
})

@withStyles(styles)
@connect(null, mapDispatchToProps)
class GatewayNew extends Component {
  constructor(props) {
    super(props)

    this.handleInputUpdate = this.handleInputUpdate.bind(this)
    this.handleStep1Submit = this.handleStep1Submit.bind(this)
    this.renderStep2 = this.renderStep2.bind(this)
    this.state = {
      gatewayName: '',
      showStep2: false
    }
  }

  handleInputUpdate(e) {
    this.setState({ gatewayName: e.target.value})
  }

  handleStep1Submit(e) {
    e.preventDefault()
    this.setState({ showStep2: true })
  }

  renderQRCode() {
    const { classes } = this.props
    const secret2fa = "otpauth://totp/BEAMCoin?secret=FAKEDATA&issuer=Helium%20Inc" // WILL UPDATE TO PROPER DATA
    return (
      <div className={classes.status}>
        <QRCode value={secret2fa}/>
        <Typography component="p" style={{marginTop: 12, fontWeight: '500'}}>
          Scan QR Code in the Helium App on your phone
        </Typography>
      </div>
    )
  }

  renderLoadingStatus() {
    const { classes } = this.props
    return (
      <div className={classes.status}>
        <CircularProgress size={75} />

        <Typography component="p" style={{marginTop: 12, fontWeight: '500'}}>
          Please wait, your gateway is being verified and written to the Helium Blockchain
        </Typography>
      </div>
    )
  }

  renderSuccess() {
    const { classes } = this.props
    return (
      <div className={classes.status}>
        <div className={classes.icon} style={{backgroundImage: "url('/images/mqtt-channel.png')"}}></div>

        <Typography component="p" style={{marginTop: 12, fontWeight: '500'}}>
          Your gateway has been successfully registered
        </Typography>
        <Button
          type="submit"
          variant="raised"
          color="primary"
          size="large"
          style={{marginTop: 12}}
        >
          View Gateway
        </Button>
      </div>
    )
  }

  renderStep2() { // will render QRCode, gatewaySuccess, or LoadingStatus depending on progress
    if (this.state.showStep2) {
      return (
        <Card style={{marginTop: 24}}>
          <CardContent>
            <Typography variant="headline">
              Step 2
            </Typography>

            {this.renderSuccess()}
          </CardContent>
        </Card>
      )
    }
  }

  render() {
    return(
      <DashboardLayout title="Register Gateway">
        <Card>
          <CardContent>
            <Typography variant="headline">
              Step 1
            </Typography>

            <Typography component="p" style={{marginTop: 12, fontWeight: '500'}}>
              Choose a name for your Gateway
            </Typography>

            <div style={{width: '50%'}}>
              <form onSubmit={this.handleStep1Submit}>
                <TextField
                  type="text"
                  label="Name"
                  name="gatewayName"
                  value={this.state.gatewayName}
                  onChange={this.handleInputUpdate}
                  disabled={this.state.showStep2}
                  fullWidth
                />
                <Button
                  type="submit"
                  variant="raised"
                  color="primary"
                  size="large"
                  style={{marginTop: 24}}
                >
                  Continue
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
        {this.renderStep2()}
      </DashboardLayout>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({}, dispatch);
}

export default GatewayNew
