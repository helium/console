import React from 'react'
import { Typography } from 'antd';
const { Text, Paragraph } = Typography

const HttpDetails = (props) => {
  const { channel } = props
  const { endpoint } = channel

  if (endpoint === undefined) return <div />

  return (
    <React.Fragment>
     
      <Paragraph><Text strong>Method: </Text><Text>{channel.method}</Text></Paragraph>
       <Paragraph><Text strong>Endpoint: </Text><Text>{channel.endpoint}</Text></Paragraph>
             <Paragraph><Text strong>Headers: </Text><Text>{channel.headers}</Text></Paragraph>
    </React.Fragment>
  )
}

export default HttpDetails
