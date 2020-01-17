import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Typography } from 'antd';
const { Text } = Typography
import Cargo from '../../../img/heliumcargo.png'

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
  { name: "Helium Cargo (HTTP)", link: "/channels/new/cargo", img: `${Cargo}` },
]

class ChannelCargoRow extends Component {
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

export default ChannelCargoRow
