import React from "react";
import numeral from "numeral";
import UserCan from "../../common/UserCan";
import { primaryBlue, tertiaryPurple } from "../../../util/colors";
import DCIMg from "../../../../img/datacredits.svg";
import BytesIMg from "../../../../img/datacredits-bytes-logo.svg";
import { Typography, Button, Card } from 'antd';
const { Text } = Typography

const MobileDataCreditsIndex = ({ organization, styles }) => {
  return (
    <div style={{ height: '100%', overflowY: 'hidden', backgroundColor: '#ffffff' }}>
      <div style={{ padding: 15, boxShadow: '0px 3px 7px 0px #ccc', backgroundColor: "#F5F7F9", height: 80 }}>
        <Text style={{ fontSize: 32, fontWeight: 600 }}>Data Credits</Text>
      </div>
      <div style={{ height: 'calc(100% - 80px)', overflowY: 'scroll' }}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            overflowX: 'scroll',
            padding: "15px 15px 0px 15px",
          }}
          className="no-scroll-bar"
        >
          <UserCan noManager>
            {organization && organization.dc_balance_nonce != 0 ? (
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => {}}
                  style={{
                    borderRadius: 4,
                    marginRight: 8,
                    display: window.disable_user_burn !== "true" ? "inline" : "none"
                  }}
                >
                  Purchase DC
                </Button>
                <Button
                  onClick={() => {}}
                  size="large"
                  style={{
                    borderRadius: 4,
                    display: !process.env.SELF_HOSTED ? "inline" : "none",
                  }}
                >
                  Automatic Renewals{" "}
                  {organization.automatic_charge_amount ? "On" : "Off"}
                </Button>
              </div>
            ) : (
              <React.Fragment />
            )}
          </UserCan>
        </div>

        <div style={{ margin: 15 }}>
          <Card
            title="Remaining DC"
            bodyStyle={{ height: 90, padding: 0 }}
          >
            <div style={{ overflowX: 'scroll', padding: 20 }} className="no-scroll-bar">
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: "center", minWidth: 300 }}>
                <img style={styles.image} src={DCIMg} />
                <Text style={{ ...styles.numberCount, color: primaryBlue }}>
                  {organization && numeral(organization.dc_balance).format("0,0")}
                </Text>
              </div>
            </div>
          </Card>
        </div>

        <div style={{ margin: 15 }}>
          <Card
            title="Remaining Bytes"
            extra={<span />}
            bodyStyle={{ height: 90, padding: 0 }}
          >
            <div style={{ overflowX: 'scroll', padding: 24 }} className="no-scroll-bar">
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: "center", minWidth: 300 }}>
                <img style={styles.image} src={BytesIMg} />
                <Text style={{ ...styles.numberCount, color: tertiaryPurple }}>
                  {organization && numeral(organization.dc_balance * 24).format("0,0")}
                </Text>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default MobileDataCreditsIndex
