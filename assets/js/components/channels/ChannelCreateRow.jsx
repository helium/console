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
    flexWrap: 'wrap'
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
    alignItems: 'center'
  },
  icon: {
    height: 100,
    width: 100,
    backgroundSize: 'cover'
  }
})

const channelTypes = [
  { name: "Azure IoT Hub", link: "/channels/new/azure", img: `url('${Azure}')` },
  { name: "AWS IoT", link: "/channels/new/aws", img: `url('${Aws}')` },
  { name: "Google Cloud IoT Core", link: "/channels/new/google", img: `url('${Google}')` },
  { name: "MQTT", link: "/channels/new/mqtt", img: `url('${Mqtt}')` },
  { name: "HTTP", link: "/channels/new/http", img: `url('${Http}')` },
]

@withStyles(styles)
class ChannelCreateRow extends Component {
  render() {
    const { channels, deleteChannel, classes } = this.props

    return(
      <div className={classes.createRow}>
        {
          channelTypes.map(channel => (
            <ButtonBase key={channel.name} component={Link} to={channel.link} className={classes.button}>
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
