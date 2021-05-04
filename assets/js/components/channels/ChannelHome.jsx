import React, { Component } from 'react'
import ChannelDashboardLayout from './ChannelDashboardLayout'
import _JSXStyle from "styled-jsx/style"

class ChannelHome extends Component {
  render() {
    return (
      <ChannelDashboardLayout {...this.props}>
        <div className="blankstateWrapper">
          <div className="message">
            <h1>Integrations</h1>
            <div className="explainer">
              <p>More details about adding Integrations can be found <a href="https://docs.helium.com/use-the-network/console/integrations/" target="_blank"> here.</a></p>
            </div>
          </div>
          <style jsx>{`
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
              color: #096DD9;
            }
            h1, p  {
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
    )
  }
}

export default ChannelHome
