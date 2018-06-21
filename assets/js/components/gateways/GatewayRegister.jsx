import React, { Component } from 'react'
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import DashboardLayout from '../common/DashboardLayout'
import GatewayQRCode from './GatewayQRCode'

//MUI
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
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
class GatewayRegister extends Component {
  constructor(props) {
    super(props)

    this.renderStep2 = this.renderStep2.bind(this)
  }

  renderQRCode() {
    const { classes, gateway } = this.props
    return (
      <div className={classes.status}>
        <GatewayQRCode gateway={gateway}/>
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

  renderStep2() { // will render QRCode, LoadingStatus depending on progress
    const { gateway } = this.props

    return (
      <Card style={{marginTop: 24}}>
        <CardContent>
          <Typography variant="headline">
            Step 2
          </Typography>

          {gateway.public_key == null ? this.renderQRCode() : this.renderLoadingStatus()}
        </CardContent>
      </Card>
    )
  }

  render() {
    const { gateway } = this.props
    return(
      <div>
        <Card>
          <CardContent>
            <Typography variant="headline">
              Step 1
            </Typography>
            <Typography component="p" style={{marginTop: 12}}>
              ID: {gateway.id}
            </Typography>
            <Typography component="p">
              Name: {gateway.name}
            </Typography>

            <Typography component="p" style={{marginTop: 12, fontWeight: '500'}}>
              You can change the gateway name after registration
            </Typography>

          </CardContent>
        </Card>
        {this.renderStep2()}
      </div>
    )
  }
}

export default GatewayRegister
