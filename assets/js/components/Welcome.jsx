import React, { Component } from 'react'
import { Link } from 'react-router-dom';
import DashboardLayout from './common/DashboardLayout'
import UserCan from './common/UserCan'
import analyticsLogger from '../util/analyticsLogger'
import { Button, Typography, Checkbox } from 'antd';
import { RocketFilled, CalendarFilled, CaretRightOutlined } from '@ant-design/icons';
const { Text } = Typography
import WelcomeImg from '../../img/welcome-image.png'
import BulbImg from '../../img/bulb.svg'
import PlusCircle from '../../img/pluscircle.svg'
import classNames from 'classnames';
import _JSXStyle from "styled-jsx/style"

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
        user={this.props.user}
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
              <img src={PlusCircle} className="pluscircle" />
              <img src={WelcomeImg} className="welcomeimg" />
            </div>
          </div>

          <div className="flexwrapper">
            <div className="pod" id="left">
              <RocketFilled className="bigicon" />
                <h2>Get Started with Console</h2>
              <Link to="/devices"><p>Add and Manage Devices <span>for the Helium Network</span><CaretRightOutlined className="caret" /></p></Link>
              <Link to="/integrations"><p>Set up an Integration <span>to send and receive device data</span><CaretRightOutlined className="caret" /></p></Link>
              <Link to="/labels"><p>Add and Manage Labels <span>to organize your devices</span><CaretRightOutlined className="caret" /></p></Link>
              <Link to="/functions"><p>Apply Functions <span>to your devices</span><CaretRightOutlined className="caret" /></p></Link>
              <Link to="/users"><p>Invite other Users <span> to your Console Organization</span><CaretRightOutlined className="caret" /></p></Link>
            </div>

            <div className="pod" id="right">
              <CalendarFilled className="bigicon" id="purple" />
              <h2>Developer Resources</h2>
              <a href="https://docs.helium.com/" target="_blank"><p><span>View</span> Documentation and Tutorials<CaretRightOutlined className="caret" /></p></a>
              <a href="https://www.youtube.com/playlist?list=PLtKQNefsR5zNjWkXqdRXeBbSmYWRJFCuo" target="_blank"><p><span>Watch our</span> How-to Videos<CaretRightOutlined className="caret" /></p></a>
              <a href="http://chat.helium.com/" target="_blank"><p><span>Join our</span> Community Discord Channel<CaretRightOutlined className="caret" /></p></a>
              <a href="https://engineering.helium.com/" target="_blank"><p><span>Read our</span> Engineering Update Blog<CaretRightOutlined className="caret" /></p></a>
            </div>
          </div>
        </div>

            <style jsx>{`

              .welcomewrapper {
                max-width: 1100px;
                margin: 0 auto;
                margin-top: 40px
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
                font-weight: 600;
              }

              .pod {
                background: #F6F8FA;
                border-radius: 20px;
                padding: 30px 40px;
                box-sizing: border-box;
                width: 100%;
margin-top: 30px;
              }

              .pod h2 {
                color: #262626;
                display:inline-block;
                margin-bottom: 26px;

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
                background: #F6F8FA;
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
