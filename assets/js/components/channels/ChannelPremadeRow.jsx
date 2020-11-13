import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { IntegrationTypeTile } from './IntegrationTypeTile';
import { PREMADE_CHANNEL_TYPES } from '../../util/integrationInfo';

const styles = {
  createRow: {
    display: 'flex',
    justifyContent: 'flex-start',
    width: 'auto'
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

class ChannelPremadeRow extends Component {
  render() {
    return(
      <div style={styles.createRow}>
        {
          PREMADE_CHANNEL_TYPES.map((channel, i) => {
            if (channel.name) return (
              <div className="wrapper" style={{ ...styles.button, opacity: channel.inactive && '0.3', filter: channel.inactive && 'grayscale(1)' }} key={channel.name}>
                <Link to={channel.link}>
                  <IntegrationTypeTile 
                    tileStyle={styles.tile} 
                    iconStyle={styles.icon} 
                    img={channel.img}
                    name={channel.name}
                    type="HTTP"
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
            )
            return (
              <div style={{width: '19%', minWidth: 120}} key={i} />
            )
          })
        }
      </div>
    )
  }
}

export default ChannelPremadeRow
