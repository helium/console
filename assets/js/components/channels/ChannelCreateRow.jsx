import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Typography } from 'antd';
const { Text } = Typography
import Azure from '../../../img/azure-channel.png'
import Aws from '../../../img/aws-channel.png'
import Google from '../../../img/google-channel.svg'
import Mqtt from '../../../img/mqtt-channel.png'
import Http from '../../../img/http-channel.png'

const styles = {
  createRow: {
    display: 'flex',
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
    marginBottom: 10
  }
}

const channelTypes = [
  { name: "HTTP", link: "/channels/new/http", img: `${Http}` },
  { name: "MQTT", link: "/channels/new/mqtt", img: `${Mqtt}` },
  { name: "Azure IoT - Coming Soon", link: "/channels/new/azure", img: `${Azure}`, inactive: true },
  { name: "AWS IoT - Coming Soon", link: "/channels/new/aws", img: `${Aws}`, inactive: true },
  { name: "Google IoT - Coming Soon", link: "/channels/new/google", img: `${Google}`, inactive: true },
]

class ChannelCreateRow extends Component {
  render() {
    const { channels } = this.props

    return(
      <div style={styles.createRow}>
        {
          channelTypes.map(channel => (
            <div style={{ ...styles.button, opacity: channel.inactive && '0.3', webkitFilter: channel.inactive && 'grayscale(1)' }} key={channel.name}>
              <Link to={channel.link}>
                <div style={styles.tile}>
                  <img style={styles.icon} src={channel.img} />
                  <Text>
                    {channel.name}
                  </Text>
                </div>
              </Link>
            </div>
          ))
        }
      </div>
    )
  }
}

export default ChannelCreateRow
