import React, { Component } from "react";
import ChannelDashboardLayout from "./ChannelDashboardLayout";
import { minWidth } from '../../util/constants'
import _JSXStyle from "styled-jsx/style";

class ChannelHome extends Component {
  render() {
    return (
      <ChannelDashboardLayout {...this.props}>
        <div className="blankstateWrapper no-scroll-bar" style={{ overflowX: 'scroll' }}>
          <div className="message" style={{ minWidth }}>
            <h1>Integrations</h1>
            <div className="explainer">
              <p>
                Integrations enable devices to connect to pre-configured,
                cloud-based applications or send data directly over HTTP or
                MQTT.
              </p>
              <p>
                <a
                  className="help-link"
                  href="https://docs.helium.com/use-the-network/console/integrations/"
                  target="_blank"
                >
                  Learn more about Integrations
                </a>
              </p>
            </div>
          </div>
          <style jsx>
            {`
              .message {
                width: 100%;
                max-width: 500px;
                margin: 0 auto;
                text-align: center;
              }
              .explainer {
                padding: 20px 60px 1px 60px;
                border-radius: 20px;
                text-align: center;
                margin-top: 20px;
                box-sizing: border-box;
                border: none;
              }
              .explainer p {
                color: #565656;
                font-size: 15px;
              }
              .explainer p a {
                color: #096dd9;
              }
              h1,
              p {
                color: #242425;
              }
              h1 {
                font-size: 46px;
                margin-bottom: 10px;
                font-weight: 600;
                margin-top: 10px;
              }
              p {
                font-size: 20px;
                font-weight: 300;
                margin-bottom: 10px;
              }
            `}
          </style>
        </div>
      </ChannelDashboardLayout>
    );
  }
}

export default ChannelHome;
