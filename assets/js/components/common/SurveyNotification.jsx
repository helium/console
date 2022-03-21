import React from 'react'
import { PopupButton } from '@typeform/embed-react'
import moment from 'moment'
import numeral from 'numeral'
import { Link } from 'react-router-dom';
import { submittedOrganizationSurvey } from "../../actions/organization";
import { minWidth } from '../../util/constants'
import { Typography, Button } from 'antd';
const { Text } = Typography

const styles = {
  text: { lineHeight: 'normal', fontSize: 16, display: 'block', marginBottom: 12 }
}

export default ({ organization, toggleSurveyNotification, mobile }) => {
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
      onClick={toggleSurveyNotification}
    >
      <div style={{ marginTop: 55, height: '100vh', width: '100vw', backgroundColor: 'rgba(37,41,46,0.8)' }}>
        <div
          style={{ backgroundColor: 'white', padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          onClick={e => {
            e.stopPropagation()
          }}
        >
          <div style={{ maxWidth: 720, minWidth: mobile ? 300 : minWidth }}>
            <Text
              style={{
                fontWeight: 600,
                display: 'block',
                lineHeight: 'normal',
                fontSize: 20,
                marginBottom: 16
              }}
            >
              Helium Console
            </Text>
            <Text style={styles.text}>
              Thank you for creating an account. Devices need Data Credits (DC) to send data.
            </Text>
            <Text style={styles.text}>
              Your current DC balance is {organization && numeral(organization.dc_balance).format("0,0")}.
            </Text>
            <Text style={styles.text}>
              To claim more DC (total 10,000), complete the survey (2 minutes) and add an active device within 30 days of {organization && moment(organization.inserted_at).format("LL")}.
            </Text>

            <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', justifyContent: 'flex-end', marginTop: 20 }}>
              { organization && !organization.survey_token_inserted_at && (
                <PopupButton
                  id="j9LV2ScD"
                  className="launch-survey-button"
                  onSubmit={submittedOrganizationSurvey}
                  style={{ lineHeight: 'normal', height: 36, marginLeft: mobile ? 0 : 10, marginTop: 4 }}
                >
                  Take Survey
                </PopupButton>
              )}
              { organization && !organization.has_device && (
                <Button
                  type="primary"
                  style={{ marginLeft: mobile ? 0 : 10, marginTop: 4 }}
                  onClick={toggleSurveyNotification}
                >
                  <Link to={`/devices/new`}>
                    Add Device
                  </Link>
                </Button>
              )}
              { organization && organization.has_device && !organization.first_packet_received_at && (
                <Button
                  style={{ marginLeft: mobile ? 0 : 10, marginTop: 4 }}
                  disabled={true}
                >
                  Awaiting First Packet...
                </Button>
              )}
              <Button
                onClick={toggleSurveyNotification}
                style={{ marginLeft: mobile ? 0 : 10, marginTop: 4 }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
