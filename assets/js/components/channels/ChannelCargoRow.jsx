import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Typography } from 'antd';
const { Text } = Typography
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
  }
}

const channelTypes = [
  { name: "Helium Cargo (HTTP)", link: "/channels/new/cargo", img: `${Http}` },
]

class ChannelCargoRow extends Component {
  render() {
    const { channels } = this.props

    return(
      <div style={styles.createRow}>
        {
          channelTypes.map(channel => (
            <div style={{ ...styles.button, backgroundColor: channel.inactive && '#CFCFCF' }} key={channel.name}>
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
