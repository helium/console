import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles';

//MUI
import Typography from '@material-ui/core/Typography';
import ButtonBase from '@material-ui/core/Button';

import Azure from '../../../img/azure-channel.png'
import Aws from '../../../img/aws-channel.png'
import Google from '../../../img/google-channel.svg'
import Mqtt from '../../../img/mqtt-channel.png'
import Http from '../../../img/http-channel.png'

const styles = theme => ({
  createRow: {
    display: 'flex',
    marginTop: theme.spacing.unit,
    justifyContent: 'space-between'
  },
  button: {
    width: '19%',
    textTransform: 'none',
    textAlign: 'center',
    minWidth: 120
  },
  tile: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  icon: {
    height: 100,
    width: 100,
    backgroundSize: 'cover'
  }
})

const channelTypes = [
  { name: "HTTP", link: "/channels/new/http", img: `url('${Http}')` },
  { name: "MQTT - Coming Soon", link: "/channels/new/mqtt", img: `url('${Mqtt}')`, inactive: true },
  { name: "Azure IoT - Coming Soon", link: "/channels/new/azure", img: `url('${Azure}')`, inactive: true },
  { name: "AWS IoT - Coming Soon", link: "/channels/new/aws", img: `url('${Aws}')`, inactive: true },
  { name: "Google IoT - Coming Soon", link: "/channels/new/google", img: `url('${Google}')`, inactive: true },
]

@withStyles(styles)
class ChannelCreateRow extends Component {
  render() {
    const { channels, classes } = this.props

    return(
      <div className={classes.createRow}>
        {
          channelTypes.map(channel => (
            <ButtonBase key={channel.name} component={Link} to={channel.link} className={classes.button} style={{ backgroundColor: channel.inactive && '#CFCFCF' }}>
              <div className={classes.tile}>
                <div className={classes.icon} style={{backgroundImage: channel.img}}></div>
                <Typography component="p" style={{marginTop: 12}}>
                  {channel.name}
                </Typography>
              </div>
            </ButtonBase>
          ))
        }
      </div>
    )
  }
}

export default ChannelCreateRow
