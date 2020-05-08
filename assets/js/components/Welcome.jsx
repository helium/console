import React, { Component } from 'react'
import { Link } from 'react-router-dom';
import DashboardLayout from './common/DashboardLayout'
import UserCan from './common/UserCan'
import analyticsLogger from '../util/analyticsLogger'
import { Button, Typography, Checkbox, Icon } from 'antd';
const { Text } = Typography
import WelcomeImg from '../../img/welcome-image.png'
import BulbImg from '../../img/bulb.svg'
import PlusCircle from '../../img/pluscircle.svg'
import classNames from 'classnames';
import Fade from 'react-reveal/Fade';
import Slide from 'react-reveal/Slide';



class Welcome extends Component {
  state = {
    hideWelcomeScreen: localStorage.getItem('hideWelcomeScreen')
  }

  componentDidMount() {
    analyticsLogger.logEvent("ACTION_NAV_WELCOME_PAGE")
  }

  onChangeCheckbox = () => {
    if (localStorage.getItem('hideWelcomeScreen')) {
      localStorage.removeItem('hideWelcomeScreen')
      this.setState({ hideWelcomeScreen: false })
    } else {
      localStorage.setItem('hideWelcomeScreen', 'hidden')
      this.setState({ hideWelcomeScreen: true })
    }
  }

  render() {
    return(
      <DashboardLayout
        title={undefined}
        noHeaderPadding
      >
        <div className="welcomewrapper">
          <div className="flexwrapper" id="introwrapper">
            <div className="welcometext" id="left">

              <h1><span>Welcome to</span><br/>Helium Console</h1>
              <p className="introp">Harness the power of the world's first peer-to-peer wireless network</p>

              <div className="checkboxWrapper">

               <Checkbox
                  checked={this.state.hideWelcomeScreen ? false : true}
                  style={{ color: '#556B8C' }}
                  onChange={this.onChangeCheckbox}
                >
                  Show this Welcome Screen every time I log in
                </Checkbox>

              </div>
            </div>
            <div id="right">
              <Fade right>
              <img src={PlusCircle} className="pluscircle" />
              </Fade>
              <img src={WelcomeImg} className="welcomeimg" />
            </div>
          </div>

          <div className="flexwrapper">
            <Fade>
              <div className="pod" id="left">
                <Icon className="bigicon" type="rocket" theme="filled" />
                  <h2>Get Started with Console</h2>
                <Link to="/devices"><p>Add and Manage Devices <span>for the Helium Network</span><Icon className="caret" type="caret-right" /></p></Link>
                <Link to="/integrations"><p>Set up an Integration <span>to send and receive device data</span><Icon className="caret" type="caret-right" /></p></Link>
                <Link to="/labels"><p>Create and Manage Labels <span>to organize your devices</span><Icon className="caret" type="caret-right" /></p></Link>
                <Link to="/functions"><p>Apply Functions <span>to your devices</span><Icon className="caret" type="caret-right" /></p></Link>
                <Link to="/users"><p>Invite other Users <span> to your Console Organization</span><Icon className="caret" type="caret-right" /></p></Link>
              </div>
            </Fade>
            <Fade delay={300}>
            <div className="pod" id="right">
              <Icon className="bigicon" id="purple" type="calendar" theme="filled" />
              <h2>Developer Resources</h2>
              <a href="https://developer.helium.com/" target="_blank"><p><span>View</span> Documentation and Tutorials<Icon className="caret" type="caret-right" /></p></a>
              <a href="https://www.youtube.com/channel/UCEdh5moyCkiIrfdkZOnG5ZQ/videos" target="_blank"><p><span>Watch our</span> Hot-to Videos<Icon className="caret" type="caret-right" /></p></a>
              <a href="http://chat.helium.com/" target="_blank"><p><span>Join our</span> Community Slack Channel<Icon className="caret" type="caret-right" /></p></a>
              <a href="https://engineering.helium.com/" target="_blank"><p><span>Read our</span> Engineering Update Blog<Icon className="caret" type="caret-right" /></p></a>
            </div>
            </Fade>
          </div>
        </div>

            <style jsx>{`

              .welcomewrapper {
                max-width: 1100px;
                margin: 0 auto;
              }

              .bulb {
                background: #B4C4DE;
                width:110px;
                position: relative;
                border-radius: 10px 0 0 10px;
                margin: 0;
                text-align: center;
                padding-top: 10px;
              }

              #tip {
                margin-top: 30px;
              }

              .bulb p {
                font-size: 20px;
                margin: 0;
                margin-top: -5px;
                color: white;
                font-weight: 500;
              }

              img.pluscircle {
                position: absolute;
                left: -100px;
              }

             .tiptextwrapper {
                padding: 30px;
                background: #DCE5F2;
                border-radius: 0 10px 10px 0;
                width: calc(100% - 110px);
              }

              .tiptextwrapper p {
                font-weight: 300;
                color: #556B8C;
                font-size: 20px;
                margin-bottom: 6px;
              }

              .tiptextwrapper a {
                color: #096DD9;

              }

              .welcomewrapper a:hover {
                text-decoration: underline;
              }

              .welcomewrapper a:hover i {
                margin-left: 12px;
              }

              .caret {
                margin-left: 6px;
                font-size: 14px;

              }

              h1 {
                font-size: 46px;
                color: #242425;
                line-height: 1;
                margin-top: 70px;
              }

              .pod {
                background: #fff;
                border-radius: 20px;
                padding: 30px 40px;
                box-sizing: border-box;
                width: 100%;
box-shadow: 0 71px 44px -40px #C6D3E8;
margin-top: 50px;
              }

              .pod h2 {
                color: #262626;
                display:inline-block;
                margin-bottom: 26px;

              }

              .pod#left a {
                color: #096DD9;
              }

               .pod#right a {
                color: #722ED1;
              }

              .pod a p {
                margin-bottom: 10px;
                font-size: 16px;
                font-weight: 400;
              }

              .pod a p span {
                font-weight: 300;
              }

              .bigicon {
                color: #2F54EB;
                font-size: 24px;
                position: relative;
                top: 1px;
                margin-right: 10px;
              }

              .bigicon#purple {
                color: #722ED1;
              }

              h1 span {
                font-weight: 300;
              }

              p.introp {

                font-size: 20px;
                color: #556B8C;
                font-weight: 300;
                line-height: 1.3;
                max-width: 370px;
              }

              .checkboxWrapper {
                padding: 12px 20px 13px;
                border-radius: 10px;
                background: #DCE5F2;
                display: inline-block;
                margin-top: 10px;
              }

              #left, #right {
                max-width: calc(50% - 15px);
                position:relative;
              }

              #introwrapper {
                text-align: left;
              }

              .welcometext {
                text-align: left;
              }



              .flexwrapper {
                display: flex;
                justify-content: space-between;
                margin-bottom: 60px;
                align-items: stretch;
                flex-wrap: wrap;
                width: 100%;
              }

              img.welcomeimg {
                width: 100%;
position: relative;
right: -37px;
top: 70px;

              }


                @media only screen and (max-width: 991px) {

                    #left, #right {
                      max-width: 100%;


                    }

                    #introwrapper {
                      flex-direction: column-reverse;
                      text-align: center;
                    }



              .welcometext {
                text-align: center;
              }

              img.welcomeimg {
                width: 100%;
                max-width: 450px;
                margin: 0 auto;
                margin-bottom: 20px;
            position: initial;
                          }


img.pluscircle {
  display: none;
}

                    .welcometext {
                      text-align: center;
                      margin: 0 auto;
                    }

                    .welcometext p, .welcometext h1 {
                      margin: 0;
                      margin-bottom: 20px;
                    }

                }


                `}</style>
      </DashboardLayout>
    )
  }
}

export default Welcome
