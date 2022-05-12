import React, { Component } from "react";
import { Link } from "react-router-dom";
import { IntegrationTypeTile } from "./IntegrationTypeTile";
import { COMMUNITY_INTEGRATION_TYPES, getAllowedIntegrations } from "../../util/integrationInfo";
import _JSXStyle from "styled-jsx/style";

const styles = {
  createRow: {
    display: "flex",
    justifyContent: "flex-start",
    width: "auto",
  },
  button: {
    textTransform: "none",
    textAlign: "center",
    minWidth: 140,
  },
  tile: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  icon: {
    height: 100,
    width: 100,
    marginBottom: 10,
  },
};

class ChannelPremadeRow extends Component {
  render() {
    const { mobile, allChannels } = this.props;
    const allowedIntegrations = getAllowedIntegrations()

    return (
      <div
        style={{
          ...styles.createRow,
          ...(mobile && { flexWrap: "wrap", justifyContent: "center" }),
        }}
      >
        {COMMUNITY_INTEGRATION_TYPES.filter(i => allowedIntegrations[i.type]).map((channel, i) => {
          if (channel.name)
            return (
              <div
                className="wrapper"
                style={{
                  ...styles.button,
                  opacity: channel.inactive && "0.3",
                  filter: channel.inactive && "grayscale(1)",
                  ...(mobile && { minWidth: 100, width: 100 }),
                }}
                key={channel.name}
              >
                <Link
                  to="#"
                  onClick={(e) => {
                    e.preventDefault();
                    this.props.selectType(channel.type);
                  }}
                >
                  <IntegrationTypeTile
                    tileStyle={styles.tile}
                    iconStyle={{
                      ...styles.icon,
                      ...(mobile && { width: 80, height: 80 }),
                    }}
                    img={channel.img}
                    name={channel.name}
                    type={channel.name === "Adafruit IO" ? "MQTT" : "HTTP"}
                    count={(allChannels && allChannels.filter(c => c.type === channel.type).length) || 0}
                  />
                </Link>
                <style jsx>{`
                  .wrapper {
                    background: white;
                    padding: 20px 10px 16px;
                    border-radius: 20px;
                    transition: all 0.2s ease;
                  }

                  .wrapper:hover {
                    background: #f0f2f5;
                    transition: all 0.2s ease;
                  }

                  .wrapper img {
                    transform: scale(1);
                    transition: all 0.2s ease;
                  }

                  .wrapper:hover img {
                    transform: scale(1.03);
                    transition: all 0.2s ease;
                  }
                `}</style>
              </div>
            );
          return <div style={{ width: "19%", minWidth: 120 }} key={i} />;
        })}
      </div>
    );
  }
}

export default ChannelPremadeRow;
