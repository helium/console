import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Typography } from 'antd';
const { Text } = Typography
import Cargo from '../../../img/heliumcargo.png'
import MyDevices from '../../../img/mydevices.svg'

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
  { name: "Helium Cargo (HTTP)", link: "/integrations/new/cargo", img: `${Cargo}` },
  { name: "Cayenne (HTTP)", link: "/integrations/new/mydevices", img: `${MyDevices}` },
  {},
  {},
  {},
]

class ChannelPremadeRow extends Component {
  render() {
    const { channels } = this.props

    return(
      <div style={styles.createRow}>
        {
          channelTypes.map(channel => {
            if (channel.name) return (
              <div style={{ ...styles.button, opacity: channel.inactive && '0.3', filter: channel.inactive && 'grayscale(1)' }} key={channel.name}>
                <Link to={channel.link}>
                  <div style={styles.tile}>
                    <img style={styles.icon} src={channel.img} />
                    <Text>
                      {channel.name}
                    </Text>
                  </div>
                </Link>
              </div>
            )
            return (
              <div style={{width: '19%', minWidth: 120}}/>
            )
          })
        }
      </div>
    )
  }
}

export default ChannelPremadeRow
