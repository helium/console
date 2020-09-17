import React from 'react'
import { Typography } from 'antd';
const { Text, Paragraph } = Typography

const MqttDetails = (props) => {
  const { channel } = props
  const { credentials } = channel;

  if (credentials === undefined) return <div />
  return (
    <React.Fragment>
      <Paragraph><Text strong>Endpoint: </Text><Text>{credentials.endpoint}</Text></Paragraph>
      <Paragraph><Text strong>Uplink Topic: </Text><Text>{credentials.uplink.topic}</Text></Paragraph>
      <Paragraph><Text strong>Downlink Topic: </Text><Text>{credentials.downlink.topic}</Text></Paragraph>
    </React.Fragment>
  )
}

export default MqttDetails