import React, { Component } from 'react'
import { Typography, Input } from 'antd';
const { Text } = Typography

const HttpDetails = (props) => {
  const { channel } = props
  const { endpoint } = channel

  if (endpoint === undefined) return <div />

  return (
    <React.Fragment>
      <Text strong>
        HTTP Details
      </Text>
      <br />
      <Text>
        Method: {channel.method}
      </Text>
      <br />
      <Text>
        Endpoint: {channel.endpoint}
      </Text>
      <br />
      <Text>
        Headers: {channel.headers}
      </Text>
    </React.Fragment>
  )
}

export default HttpDetails
