import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles';

//MUI
import Typography from '@material-ui/core/Typography';
import ButtonBase from '@material-ui/core/Button';

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
  { name: "Azure IoT Hub", link: "/channels/new/azure", img: "url('/images/azure-channel.png')" },
  { name: "AWS IoT", link: "/channels/new/aws", img: "url('/images/aws-channel.png')" },
  { name: "Google Cloud IoT Core", link: "/channels/new/google", img: "url('/images/google-channel.svg')" },
  { name: "MQTT", link: "/channels/new/mqtt", img: "url('/images/mqtt-channel.png')" },
  { name: "HTTP", link: "/channels/new/http", img: "url('/images/http-channel.png')" },
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
