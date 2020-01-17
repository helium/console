import React, { Component } from 'react'
import DashboardLayout from '../common/DashboardLayout'
import analyticsLogger from '../../util/analyticsLogger'
import { Icon, Typography, Card, Badge } from 'antd';
const { Text, Title } = Typography

class DataCredits extends Component {
  componentDidMount() {
    analyticsLogger.logEvent("ACTION_NAV_DATA_CREDITS")
  }

  render() {
    return (
      <DashboardLayout title="Data Credits">
      <Card>
        
          <Title level={3}>
            Purchase Data Credits from Helium to send device data.
          </Title>
          <br />
          <Text>
            The cost per fragment is $0.00001 USD (fragments are 24 bytes) which is equivalent to 1 Data Credit (DC).
          </Text>
          <br />
          <Text>
            During the Beta, the cost to send packets is 0 DC.
          </Text>
      
        </Card>
      </DashboardLayout>
    )
  }
}

export default DataCredits
