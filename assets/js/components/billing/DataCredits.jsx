import React, { Component } from 'react'
import DashboardLayout from '../common/DashboardLayout'
import analyticsLogger from '../../util/analyticsLogger'
import { Icon, Typography, Card, Badge } from 'antd';
import DCIMg from '../../../img/datacredits.svg'
import classNames from 'classnames';
const { Text, Title } = Typography

class DataCredits extends Component {
  componentDidMount() {
    analyticsLogger.logEvent("ACTION_NAV_DATA_CREDITS")
  }

  render() {
    return (
      <DashboardLayout title="Data Credits">


      <div className="blankstateWrapper">
      <div className="message">
<img style={{width: 100, marginBottom: 20}} src={DCIMg} />
<h1>You have no Data Credits</h1>
<p>Data Credits are an upcoming feature.</p>

<div className="explainer">
  <h2>What are Data Credits?</h2>
<p>Data Credits are used by devices to send data via the Helium Network. The cost per fragment is $0.00001 USD (fragments are 24 bytes) which is equivalent to 1 Data Credit (DC). During the Beta, the cost to send packets is 0 DC.</p>
<p>More details can be found <a href="https://developer.helium.com/longfi/data-credits" target="_blank"> here.</a></p>

</div>



      </div>
      <style jsx>{`

         .message {
            
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            text-align: center;

          }

          .explainer {
            background: #DFE8F4;
            padding: 20px 60px;
            border-radius: 20px;
            border: 1px solid #CCD7E9;
            text-align: center;
            margin-top: 50px;
            box-sizing: border-box;
          }

          .explainer h2 {
            color: #242425;
            font-size: 20px;
          }
          .explainer p {
            color: #556B8C;
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
          }
          p {
            font-size: 20px;
            font-weight: 300;
          }


          .blankstateWrapper {
            width: 100%;
            padding-top: 150px;
            margin: 0 auto;
            position: relative;

            
          }
        `}</style>

      </div>





     


      </DashboardLayout>
    )
  }
}

export default DataCredits
