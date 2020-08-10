import React from 'react';
import { Card, Typography, Input, InputNumber } from 'antd';

const { Title } = Typography;

const Downlink = (props) => {
  return (
    <Card style={{marginRight: 15, marginLeft: 15}}>
      <Title style={{fontSize: 26}}>Create Downlink Payload</Title>
      <InputNumber/>
      <Input/>
    </Card>
  )
}

export default Downlink