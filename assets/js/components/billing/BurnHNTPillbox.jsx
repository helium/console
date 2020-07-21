import React from 'react'
import { Popover, Icon, Typography } from 'antd';
import Countdown from "react-countdown"
const { Text } = Typography

const BurnHNTPillbox = ({ nextTimeStamp, hntToBurn }) => (
  <div style={{ marginTop: 20, paddingLeft: 10, paddingRight: 10, width: '100%' }}>
    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#4091F7', padding: 10, borderRadius: 40 }}>
      <Popover
        content="The HNT equivalent price  is based on Helium Oracle Data which updates every 30-60 mins."
        placement="bottom"
        overlayStyle={{ width: 220 }}
      >
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 20, paddingLeft: 8, paddingRight: 8, display: 'flex', flexDirection: 'row', paddingTop: 2, paddingBottom: 2 }}>
          <Countdown
            date={nextTimeStamp}
            renderer={({ minutes, seconds }) => {
              if (minutes < 10) minutes = "0" + minutes
              if (seconds < 10) seconds = "0" + seconds
              return <span style={{ color: '#40A9FF', fontSize: 14, cursor: 'pointer' }}><Icon type="clock-circle" style={{ marginRight: 5, paddingTop: 4 }}/>{minutes}:{seconds}</span>
            }}
          />
        </div>
      </Popover>
      <Text style={{ color: '#FFFFFF', fontSize: 14 }}>or Burn {hntToBurn} HNT</Text>
    </div>
  </div>
)

export default BurnHNTPillbox
