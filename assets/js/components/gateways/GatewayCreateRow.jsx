import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles';
import Mqtt from '../../../img/mqtt-channel.png'

//MUI
import Typography from '@material-ui/core/Typography';
import ButtonBase from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

const styles = theme => ({
  createRow: {
    display: 'flex',
    marginTop: theme.spacing.unit,
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  button: {
    width: '20%',
    textTransform: 'none',
    textAlign: 'center',
    minWidth: 120
  },
  tile: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  icon: {
    height: 100,
    width: 100,
    backgroundSize: 'cover'
  }
})

@withStyles(styles)
class GatewayCreateRow extends Component {
  render() {
    const { classes } = this.props

    return(
      <div className={classes.createRow}>
        <ButtonBase key="Register Gateway" component={Link} to={"/gateways/new"} className={classes.button}>
          <div className={classes.tile}>
            <div className={classes.icon} style={{backgroundImage: `url('${Mqtt}')`}}></div>
            <Typography component="p" style={{marginTop: 12}}>
              Get Started
            </Typography>
          </div>
        </ButtonBase>
      </div>
    )
  }
}

export default GatewayCreateRow
