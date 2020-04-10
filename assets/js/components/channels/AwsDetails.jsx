import React, { Component } from 'react'
import { Typography, Input } from 'antd';
const { Text, Paragraph } = Typography

const AwsDetails = (props) => {
  const { channel } = props
  const { aws_region, topic } = channel

  if (aws_region === undefined) return <div />

  return (
    <React.Fragment>
      <Paragraph><Text strong>Region: </Text><Text>{channel.aws_region}</Text></Paragraph>
      <Paragraph><Text strong>Topic: </Text><Text>{channel.topic}</Text></Paragraph>
    </React.Fragment>
  )
}

export default AwsDetails
