import React, { Component } from 'react'
import DashboardLayout from '../common/DashboardLayout'
import analyticsLogger from '../../util/analyticsLogger'
import DefaultPaymentModal from './DefaultPaymentModal'
import { Link } from 'react-router-dom'
import { Icon, Typography, Card, Row, Col, Popover, Button } from 'antd';
import DCIMg from '../../../img/datacredits.svg'
import BytesIMg from '../../../img/datacredits-bytes-logo.svg'
import classNames from 'classnames';
const { Text, Title } = Typography
import { primaryBlue, tertiaryPurple } from '../../util/colors'
import UserCan from '../common/UserCan'

const styles = {
  tipText: {
    marginBottom: 0,
    color: primaryBlue,
  },
  image: {
    width: 33,
    marginRight: 8,
  },
  numberCount: {
    fontSize: 40,
    marginTop: -8,
  },

}

class DataCreditsIndex extends Component {
  state = {
    showDefaultPaymentModal: false,
  }

  componentDidMount() {
    analyticsLogger.logEvent("ACTION_NAV_DATA_CREDITS")
  }

  openModal = (modal) => {
    this.setState({ [modal]: true })
  }

  closeModal = (modal) => {
    this.setState({ [modal]: false })
  }

  renderBlankState = () => {
    return (
      <div className="blankstateWrapper">
        <div className="message">
          <img style={{width: 100, marginBottom: 20}} src={DCIMg} />
          <h1>Data Credits</h1>
          <p>It doesn't look like you've used Data Credits yet.</p>
          <UserCan>
            <Button
              size="large"
              type="primary"
              icon="wallet"
              onClick={() => {}}
            >
              Purchase Data Credits
            </Button>
          </UserCan>

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
    )
  }

  renderContent = () => {
    const { showDefaultPaymentModal } = this.state

    return (
      <div>
        <Row gutter={16}>
          <Col span={8}>
            <Card
              title="Total Data Credits"
              extra={
                <Popover
                  content="Data Credits - known as DCs - are used to pay all transaction fees on the Helium Network."
                  placement="bottom"
                  overlayStyle={{ width: 220 }}
                >
                  <Link to="#">
                    <Text style={styles.tipText}>What are Data Credits?</Text>
                  </Link>
                </Popover>
              }
            >
              <Row type="flex" style={{ alignItems: 'center' }}>
                <img style={styles.image} src={DCIMg} />
                <Text style={{ ...styles.numberCount, color: primaryBlue }}>1,000,000</Text>
              </Row>
            </Card>
          </Col>
          <Col span={8}>
            <Card
              title="Remaining Bytes"
              extra={
                <Popover
                  content="Your quantity of Data Credits translates directly to number of bytes that can be transmitted by your devices."
                  placement="bottom"
                  overlayStyle={{ width: 220 }}
                >
                  <Link to="#">
                    <Text style={styles.tipText}>Learn More</Text>
                  </Link>
                </Popover>
              }
            >
              <Row type="flex" style={{ alignItems: 'center' }}>
                <img style={styles.image} src={BytesIMg} />
                <Text style={{ ...styles.numberCount, color: tertiaryPurple }}>24,000,000</Text>
                <Text>Approx 24 MB</Text>
              </Row>
            </Card>
          </Col>
          <Col span={8}>
            <Card
              title="Default Payment Method"
              extra={
                <Link to="#" onClick={() => this.openModal("showDefaultPaymentModal")}>
                  <Text style={styles.tipText}>Change</Text>
                </Link>
              }
            >
              <Row type="flex" style={{ alignItems: 'center' }}>
                <Text style={{ ...styles.numberCount }}>N/A</Text>
              </Row>
            </Card>
          </Col>
        </Row>

        <DefaultPaymentModal
          open={showDefaultPaymentModal}
          onClose={() => this.closeModal("showDefaultPaymentModal")}
        />
      </div>
    )
  }

  render() {
    return (
      <DashboardLayout
        title="Data Credits"
        extra={
          <UserCan>
            <Button
              size="large"
              icon="sync"
              onClick={() => {}}
            >
              Automatic Renewals On
            </Button>
            <Button
              size="large"
              type="primary"
              icon="wallet"
              onClick={() => {}}
              style={{ marginLeft: 20 }}
            >
              Purchase Data Credits
            </Button>
          </UserCan>
        }
      >
        {this.renderContent()}
      </DashboardLayout>
    )
  }
}

export default DataCreditsIndex
