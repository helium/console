import React, { useState } from 'react';
import { Card, Typography, Input, InputNumber, Row, Col } from 'antd';

const { Title, Text } = Typography;

const Downlink = (props) => {
  const [port, setPort] = useState(1);
  return (
    <Card style={{marginRight: 15, marginLeft: 15}}>
      <Title style={{fontSize: 26, width: '100%'}}>Create Downlink Payload</Title>
      <Row>
        <Col sm={24}>
          <Text style={{width: '100%'}}>Payload</Text>
          <Input/>
        </Col>
      </Row>
      
      <Row>
        <Col sm={8}>
          <Text style={{width: '100%', textAlign: 'center'}}>Fport</Text>
          <InputNumber defaultValue={0} onChange={setPort}/>
        </Col>
      </Row>
    </Card>
  )
}

export default Downlink