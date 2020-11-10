import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Azure from '../../../img/azure-channel.svg'
import Aws from '../../../img/aws-channel.svg'
import Google from '../../../img/google-channel.svg'
import Mqtt from '../../../img/mqtt-channel.svg'
import Http from '../../../img/http-channel.svg'
import { IntegrationTypeTile } from './IntegrationTypeTile';


const styles = {
  createRow: {
    display: 'flex',
    justifyContent: 'flex-start'
  },
  button: {
    textTransform: 'none',
    textAlign: 'center',
    minWidth: 140
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
  { name: "HTTP", link: "/integrations/new/http", img: `${Http}` },
  { name: "MQTT", link: "/integrations/new/mqtt", img: `${Mqtt}` },
  { name: "AWS IoT Core", link: "/integrations/new/aws", img: `${Aws}`},
  // { name: "Azure IoT", link: "/integrations/new/azure", img: `${Azure}`, inactive: true },
  // { name: "Google IoT", link: "/integrations/new/google", img: `${Google}`, inactive: true },
]

class ChannelCreateRow extends Component {
  render() {

    return(
      <div style={styles.createRow}>
        {
          channelTypes.map(channel => (
            <div className="wrapper" style={{ ...styles.button, opacity: channel.inactive && '0.3', filter: channel.inactive && 'grayscale(1)' }} key={channel.name}>
              <Link to={channel.link}>
              <IntegrationTypeTile 
                tileStyle={styles.tile} 
                iconStyle={styles.icon} 
                img={channel.img}
                name={channel.name}
                />
              </Link>
                <style jsx>{`
                .wrapper {
                  background: white;
                  padding: 20px 10px 16px;
                  border-radius: 20px;
                  transition: all .2s ease;
                }

                .wrapper:hover {
                  background: #F0F2F5;
                    transition: all .2s ease;

                }

                .wrapper img {
                  transform: scale(1);
                    transition: all .2s ease;

                }

                .wrapper:hover img {
                  transform: scale(1.03);
                    transition: all .2s ease;

                }
              `}</style>
            </div>
          ))
        }
      </div>
    )
  }
}

export default ChannelCreateRow
