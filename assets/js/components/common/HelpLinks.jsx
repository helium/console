import React from 'react'
import Icon from '../../../img/help-links-icon.svg'
import { minWidth } from '../../util/constants'
import { Typography, Row, Col } from 'antd';
const { Text } = Typography
import CaretRightOutlined from '@ant-design/icons/CaretRightOutlined';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import { Link } from 'react-router-dom';

const styles = {
  link: {
    display: 'block',
    lineHeight: 'normal',
    marginBottom: 4,
    fontWeight: 500,
    fontSize: 16,
  },
  header1: {
    color: '#94ABC2',
    fontWeight: 400,
    display: 'block',
    lineHeight: 'normal'
  },
  header2: {
    fontWeight: 600,
    display: 'block',
    lineHeight: 'normal',
    fontSize: 20,
    marginTop: 16,
    marginBottom: 16
  }
}

export default (props) => {
  return (
    <div
      style={{
        position: 'fixed',
        height: '100vh',
        width: '100vw',
        zIndex: 110,
        top: 0,
        left: 0
      }}
      onClick={props.toggleHelpLinks}
    >
      <div style={{ marginTop: 55, height: '100vh', width: '100vw', backgroundColor: 'rgba(37,41,46,0.8)' }}>
        <div
          style={{ backgroundColor: 'white', padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          onClick={e => {
            e.stopPropagation()
          }}
        >
          <div style={{ maxWidth: 720, minWidth }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 30, justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <img draggable="false" src={Icon} style={{ marginRight: 12 }}/>
                <Text style={{ fontSize: 36, fontWeight: 600, marginRight: 8 }}>Console</Text>
                <Text style={{ fontSize: 36 }}>Support</Text>
              </span>
              <CloseOutlined style={{ color: '#94ABC2', cursor: 'pointer', fontSize: 18 }} onClick={props.toggleHelpLinks} />
            </div>

            <Row>
              <Col span={12} style={{ paddingRight: 20 }}>
                <div className="pod" id="left">
                  <Text style={styles.header1}>GENERAL SUPPORT</Text>
                  <Text style={styles.header2}>View Documentation & Tutorials</Text>
                  <a style={styles.link} href="https://docs.helium.com/use-the-network/console/quickstart/" target="_blank">Quickstart<CaretRightOutlined className="caret" /></a>
                  <a style={styles.link} href="https://docs.helium.com/use-the-network/console/" target="_blank">View Documentation and Tutorials<CaretRightOutlined className="caret" /></a>
                  <a style={styles.link} href="https://www.youtube.com/playlist?list=PLtKQNefsR5zNjWkXqdRXeBbSmYWRJFCuo" target="_blank">Watch our How-to Videos<CaretRightOutlined className="caret" /></a>
                  <a style={styles.link} href="http://chat.helium.com/" target="_blank">Join our Community Discord Channel<CaretRightOutlined className="caret" /></a>
                  <a style={styles.link} href="https://engineering.helium.com/" target="_blank">Read our Engineering Update Blog<CaretRightOutlined className="caret" /></a>
                  <a style={styles.link} href="https://github.com/helium/console/issues/" target="_blank">Feedback or Issues<CaretRightOutlined className="caret" /></a>
                </div>
              </Col>

              {renderPageLinks(props.pathname)}
            </Row>
          </div>
        </div>
      </div>
    </div>
  )
}

const renderPageLinks = pathname => {
  if (pathname.startsWith('/flows')) return (
    <Col span={12} style={{ paddingLeft: 20, borderLeft: '1px solid #C4D2DF' }}>
      <div className="pod" id="right">
        <Text style={styles.header1}>FOR THIS PAGE</Text>
        <Text style={styles.header2}>Flows</Text>
        <a style={styles.link} href="https://docs.helium.com/use-the-network/console/flows/orientation/" target="_blank">Flows Orientation<CaretRightOutlined className="caret" /></a>
        <a style={styles.link} href="https://youtu.be/XrbN1CHApBI/" target="_blank">Flows Walk Through Video<CaretRightOutlined className="caret" /></a>
        <a style={styles.link} href="https://docs.helium.com/use-the-network/console/flows/actions/" target="_blank">Common Actions<CaretRightOutlined className="caret" /></a>
        <a style={styles.link} href="https://docs.helium.com/use-the-network/console/flows/flows-faq/" target="_blank">Frequently Asked Questions<CaretRightOutlined className="caret" /></a>
        <a style={styles.link} href="https://github.com/helium/console/issues/" target="_blank">Feedback or Issues<CaretRightOutlined className="caret" /></a>
      </div>
    </Col>
  )

  if (pathname.startsWith('/devices')) return (
    <Col span={12} style={{ paddingLeft: 20, borderLeft: '1px solid #C4D2DF' }}>
      <div className="pod" id="right">
        <Text style={styles.header1}>FOR THIS PAGE</Text>
        <Text style={styles.header2}>Devices</Text>
        <a style={styles.link} href="https://docs.helium.com/use-the-network/console/adding-devices" target="_blank">Adding Devices<CaretRightOutlined className="caret" /></a>
        <a style={styles.link} href="https://docs.helium.com/use-the-network/console/adding-devices/#importing-devices" target="_blank">Importing Devices<CaretRightOutlined className="caret" /></a>
        <a style={styles.link} href="https://docs.helium.com/use-the-network/console/migrating-devices" target="_blank">Migrating from The Things Network<CaretRightOutlined className="caret" /></a>
        <a style={styles.link} href="https://docs.helium.com/use-the-network/console/labels" target="_blank">Adding and Labelling Devices<CaretRightOutlined className="caret" /></a>
        <a style={styles.link} href="https://youtu.be/ntr839pqWpg" target="_blank">Adding Devices & Labels Video<CaretRightOutlined className="caret" /></a>
        <a style={styles.link} href="https://github.com/helium/console/issues" target="_blank">Feedback or Issues<CaretRightOutlined className="caret" /></a>
      </div>
    </Col>
  )

  if (pathname.startsWith('/functions')) return (
    <Col span={12} style={{ paddingLeft: 20, borderLeft: '1px solid #C4D2DF' }}>
      <div className="pod" id="right">
        <Text style={styles.header1}>FOR THIS PAGE</Text>
        <Text style={styles.header2}>Functions</Text>
        <a style={styles.link} href="https://docs.helium.com/use-the-network/console/functions#a-primer-on-encoding-and-decoding" target="_blank">A Primer on Encoding and Decoding<CaretRightOutlined className="caret" /></a>
        <a style={styles.link} href="https://docs.helium.com/use-the-network/console/functions" target="_blank">Creating a Decoder Function<CaretRightOutlined className="caret" /></a>
        <a style={styles.link} href="https://youtu.be/UNUOLbIKXww" target="_blank">Creating and Adding Functions Video<CaretRightOutlined className="caret" /></a>
        <a style={styles.link} href="https://github.com/helium/console/issues" target="_blank">Feedback or Issues<CaretRightOutlined className="caret" /></a>
      </div>
    </Col>
  )

  if (pathname.startsWith('/integrations')) return (
    <Col span={12} style={{ paddingLeft: 20, borderLeft: '1px solid #C4D2DF' }}>
      <div className="pod" id="right">
        <Text style={styles.header1}>FOR THIS PAGE</Text>
        <Text style={styles.header2}>Integrations</Text>
        <a style={styles.link} href="https://docs.helium.com/use-the-network/console/integrations" target="_blank">Integrations<CaretRightOutlined className="caret" /></a>
        <a style={styles.link} href="https://docs.helium.com/use-the-network/console/integrations#connecting-integrations-to-devices" target="_blank">Connecting Integrations to Devices<CaretRightOutlined className="caret" /></a>
        <a style={styles.link} href="https://youtu.be/lnERw1f7TGE" target="_blank">Creating and Adding Integrations Video<CaretRightOutlined className="caret" /></a>
        <a style={styles.link} href="https://github.com/helium/console/issues" target="_blank">Feedback or Issues<CaretRightOutlined className="caret" /></a>
      </div>
    </Col>
  )

  if (pathname.startsWith('/alerts')) return (
    <Col span={12} style={{ paddingLeft: 20, borderLeft: '1px solid #C4D2DF' }}>
      <div className="pod" id="right">
        <Text style={styles.header1}>FOR THIS PAGE</Text>
        <Text style={styles.header2}>Alerts</Text>
        <a style={styles.link} href="https://docs.helium.com/use-the-network/console/adr#configuring-alerts" target="_blank">Configuring Alerts<CaretRightOutlined className="caret" /></a>
        <a style={styles.link} href="https://youtu.be/8zt6W_FCQcM" target="_blank">Setting Up Alerts Video<CaretRightOutlined className="caret" /></a>
        <a style={styles.link} href="https://github.com/helium/console/issues" target="_blank">Feedback or Issues<CaretRightOutlined className="caret" /></a>
      </div>
    </Col>
  )

  if (pathname.startsWith('/config_profiles')) return (
    <Col span={12} style={{ paddingLeft: 20, borderLeft: '1px solid #C4D2DF' }}>
      <div className="pod" id="right">
        <Text style={styles.header1}>FOR THIS PAGE</Text>
        <Text style={styles.header2}>Configuration Profiles</Text>
        <a style={styles.link} href="https://docs.helium.com/use-the-network/console/profiles/" target="_blank">Configuration Profiles<CaretRightOutlined className="caret" /></a>
        <a style={styles.link} href="https://docs.helium.com/use-the-network/console/profiles/#adr" target="_blank">ADR<CaretRightOutlined className="caret" /></a>
        <a style={styles.link} href="https://docs.helium.com/use-the-network/console/profiles/#cf-list" target="_blank">CF List<CaretRightOutlined className="caret" /></a>
        <a style={styles.link} href="https://docs.helium.com/use-the-network/console/profiles/#creating-profiles" target="_blank">Creating Profiles<CaretRightOutlined className="caret" /></a>
        <a style={styles.link} href="https://docs.helium.com/use-the-network/console/profiles/#applying-profiles" target="_blank">Applying Profiles<CaretRightOutlined className="caret" /></a>
        <a style={styles.link} href="https://docs.helium.com/use-the-network/console/profiles/#editing-or-deleting-profiles" target="_blank">Editing or Deleting Profiles<CaretRightOutlined className="caret" /></a>
      </div>
    </Col>
  )

  if (pathname.startsWith('/multi_buys')) return (
    <Col span={12} style={{ paddingLeft: 20, borderLeft: '1px solid #C4D2DF' }}>
      <div className="pod" id="right">
        <Text style={styles.header1}>FOR THIS PAGE</Text>
        <Text style={styles.header2}>Multiple Packets</Text>
        <a style={styles.link} href="https://docs.helium.com/use-the-network/console/adr#configuring-multiple-packets" target="_blank">Configuring Multiple Packets<CaretRightOutlined className="caret" /></a>
        <a style={styles.link} href="https://youtu.be/rDJcGspnq1A" target="_blank">Multiple Packets Configuration Video<CaretRightOutlined className="caret" /></a>
        <a style={styles.link} href="https://github.com/helium/console/issues" target="_blank">Feedback or Issues<CaretRightOutlined className="caret" /></a>
      </div>
    </Col>
  )

  if (pathname.startsWith('/coverage')) return (
    <Col span={12} style={{ paddingLeft: 20, borderLeft: '1px solid #C4D2DF' }}>
      <div className="pod" id="right">
        <Text style={styles.header1}>FOR THIS PAGE</Text>
        <Text style={styles.header2}>Coverage</Text>
        <a style={styles.link} href="https://docs.helium.com/use-the-network/console/coverage#identify-hotspots-that-hear-devices" target="_blank">Identify Hotspots That Hear Devices<CaretRightOutlined className="caret" /></a>
        <a style={styles.link} href="https://docs.helium.com/use-the-network/console/coverage#monitoring-hotspots-stats-and-status" target="_blank">Monitoring Hotspots Stats and Status<CaretRightOutlined className="caret" /></a>
        <a style={styles.link} href="https://docs.helium.com/use-the-network/console/coverage#creating-hotspot-aliases" target="_blank">Creating Hotspot Aliases<CaretRightOutlined className="caret" /></a>
        <a style={styles.link} href="https://youtu.be/Woh4RooY6L8" target="_blank">Coverage in Console Video<CaretRightOutlined className="caret" /></a>
        <a style={styles.link} href="https://github.com/helium/console/issues" target="_blank">Feedback or Issues<CaretRightOutlined className="caret" /></a>
      </div>
    </Col>
  )

  if (pathname.startsWith('/organizations') || pathname.startsWith('/datacredits') || pathname.startsWith('/users')) return (
    <Col span={12} style={{ paddingLeft: 20, borderLeft: '1px solid #C4D2DF' }}>
      <div className="pod" id="right">
        <Text style={styles.header1}>FOR THIS PAGE</Text>
        <Text style={styles.header2}>Organizations, Users, Data Credits</Text>
        <a style={styles.link} href="https://docs.helium.com/use-the-network/console/users#organizations" target="_blank">Organizations<CaretRightOutlined className="caret" /></a>
        <a style={styles.link} href="https://docs.helium.com/use-the-network/console/users#user-roles" target="_blank">User Roles<CaretRightOutlined className="caret" /></a>
        <a style={styles.link} href="https://docs.helium.com/use-the-network/console/users#managing-users" target="_blank">Managing Users<CaretRightOutlined className="caret" /></a>
        <a style={styles.link} href="https://docs.helium.com/use-the-network/console/data-credits" target="_blank">Data Credits<CaretRightOutlined className="caret" /></a>
        <a style={styles.link} href="https://youtu.be/jyMGLymuOCE" target="_blank">Purchasing and Renewing DCs<CaretRightOutlined className="caret" /></a>
        <a style={styles.link} href="https://github.com/helium/console/issues" target="_blank">Feedback or Issues<CaretRightOutlined className="caret" /></a>
      </div>
    </Col>
  )
}
