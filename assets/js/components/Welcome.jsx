import React, { Component } from 'react'
import { Link } from 'react-router-dom';
import DashboardLayout from './common/DashboardLayout'
import UserCan from './common/UserCan'
import analyticsLogger from '../util/analyticsLogger'
import { Button, Typography, Checkbox, Icon } from 'antd';
const { Text } = Typography
import WelcomeImg from '../../img/welcome-image.png'
import BulbImg from '../../img/welcome-tip-bulb.png'

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
        <div style={{ paddingLeft: 80, paddingRight: 80 }}>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 60 }}>
            <div style={{ minWidth: 360, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: 10 }}>
              <div><Text style={{ fontSize: 32 }}>Welcome to</Text></div>
              <div style={{ marginTop: -15 }}><Text style={{ fontSize: 32 }} strong>Helium Console</Text></div>
              <div style={{ marginTop: 10 }}><Text style={{ fontSize: 18, color: '#556B8C' }}>Harness the power of the world's first</Text></div>
              <div style={{ marginTop: -5 }}><Text style={{ fontSize: 18, color: '#556B8C' }}>peer-to-peer wireless network.</Text></div>
              <div style={{ backgroundColor: '#E1E6ED', borderRadius: 9, padding: '10px 5px 10px 15px', marginTop: 25, width: 345, marginRight: 20 }}>
                <Checkbox
                  checked={this.state.hideWelcomeScreen ? false : true}
                  style={{ color: '#777777' }}
                  onChange={this.onChangeCheckbox}
                >
                  Show this Welcome Screen every time I log in
                </Checkbox>
              </div>
            </div>
            <img src={WelcomeImg} style={{ height: 250, marginRight: -42 }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', backgroundColor: 'white', borderRadius: 14, minWidth: 400, marginRight: 20, boxShadow: '0 47px 24px -30px #C6D3E8' }}>
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <Icon style={{ fontSize: 24, marginRight: 8, position: 'relative', top: 4, color: '#2F54EB' }} type="rocket" theme="filled" />
                <Text strong style={{ fontSize: 20, marginBottom: 18 }}>Get Started with Console</Text>
              </div>
              <Link to="/devices" style={{ marginBottom: 4 }}><Text style={{ color: '#096DD9' }}>Add and Manage Devices <span style={{ fontWeight: 300 }}>for the Helium Network</span><Icon style={{ marginLeft: 5, position: 'relative', top: 1 }} type="caret-right" /></Text></Link>
              <Link to="/integrations" style={{ marginBottom: 4 }}><Text style={{ color: '#096DD9' }}>Set up an Integration <span style={{ fontWeight: 300 }}>to send and receive device data</span><Icon style={{ marginLeft: 5, position: 'relative', top: 1 }} type="caret-right" /></Text></Link>
              <Link to="/labels" style={{ marginBottom: 4 }}><Text style={{ color: '#096DD9' }}>Create and Manage Labels <span style={{ fontWeight: 300 }}>to organize your devices</span><Icon style={{ marginLeft: 5, position: 'relative', top: 1 }} type="caret-right" /></Text></Link>
              <Link to="/functions" style={{ marginBottom: 4 }}><Text style={{ color: '#096DD9' }}>Apply Functions <span style={{ fontWeight: 300 }}>to your devices</span><Icon style={{ marginLeft: 5, position: 'relative', top: 1 }} type="caret-right" /></Text></Link>
              <Link to="/users" style={{ marginBottom: 4 }}><Text style={{ color: '#096DD9' }}>Invite other Users <span style={{ fontWeight: 300 }}>to your Console Organization</span><Icon style={{ marginLeft: 5, position: 'relative', top: 1 }} type="caret-right" /></Text></Link>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', backgroundColor: 'white', borderRadius: 14, minWidth: 400, boxShadow: '0 47px 24px -30px #C6D3E8' }}>
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <Icon style={{ fontSize: 24, marginRight: 8, position: 'relative', top: 4, color: '#722ED1' }} type="calendar" theme="filled" />
                <Text strong style={{ fontSize: 20, marginBottom: 18 }}>Developer Resources</Text>
              </div>
              <a href="https://developer.helium.com/" target="_blank" style={{ marginBottom: 4 }}><Text style={{ color: '#722ED1' }}><span style={{ fontWeight: 300 }}>View</span> Documentation and Tutorials<Icon style={{ marginLeft: 5, position: 'relative', top: 1 }} type="caret-right" /></Text></a>
              <a href="https://www.youtube.com/channel/UCEdh5moyCkiIrfdkZOnG5ZQ/videos" target="_blank" style={{ marginBottom: 4 }}><Text style={{ color: '#722ED1' }}><span style={{ fontWeight: 300 }}>Watch our</span> How-to Videos<Icon style={{ marginLeft: 5, position: 'relative', top: 1 }} type="caret-right" /></Text></a>
              <a href="http://chat.helium.com/" target="_blank" style={{ marginBottom: 4 }}><Text style={{ color: '#722ED1' }}><span style={{ fontWeight: 300 }}>Join our</span> Community Slack Channel<Icon style={{ marginLeft: 5, position: 'relative', top: 1 }} type="caret-right" /></Text></a>
              <a href="https://engineering.helium.com/" target="_blank" style={{ marginBottom: 4 }}><Text style={{ color: '#722ED1' }}><span style={{ fontWeight: 300 }}>Read our</span> Engineering Update Blog<Icon style={{ marginLeft: 5, position: 'relative', top: 1 }} type="caret-right" /></Text></a>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'row', marginTop: 60 }}>
            <div style={{ backgroundColor: '#B4C5DE', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 10, maxWidth: 110, minWidth: 110, borderRadius: '9px 0px 0px 9px' }}>
              <img src={BulbImg} style={{ height: 60 }} />
              <Text style={{ fontSize: 18, color: '#FFFFFF' }}>Tip 1</Text>
            </div>
            <div style={{ backgroundColor: '#DCE5F2', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: 30, minWidth: 710, borderRadius: '0px 9px 9px 0px' }}>
              <div style={{ marginBottom: 10 }}><Text style={{ fontSize: 16, color: '#556B8C' }}>Learn how to build Integrations with myDevices and AWS IoT.</Text></div>
              <a href="https://www.youtube.com/watch?v=h6hgiztpgJA" target="_blank" style={{ marginBottom: 4 }}>
                <Text style={{ color: '#096DD9' }}>Watch our how-to video here<Icon style={{ marginLeft: 5, position: 'relative', top: 1 }} type="caret-right" /></Text>
              </a>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }
}

export default Welcome
