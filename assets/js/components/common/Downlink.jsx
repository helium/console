import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const Downlink = (props) => {
  return (
    <Card style={{marginRight: 15, marginLeft: 15}}>
      <Title style={{fontSize: 22}}>Create Downlink Payload</Title>
    </Card>
  )
}

export default Downlink