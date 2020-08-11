import React, { useState } from 'react';
import { Card, Typography, Input, InputNumber, Row, Col, Radio } from 'antd';
import DownlinkImage from '../../../img/downlink.svg';

const { Title, Text } = Typography;
const { Group, Button } = Radio;

const inputHeadingStyle = {
  fontSize: 14,
  fontWeight: 600
}

const Downlink = (props) => {
  const [port, setPort] = useState(1);
  const [payloadType, setPayloadType] = useState('bytes');
  return (
    <div style={{position: 'relative'}}>
      <Card style={{marginRight: 20, marginLeft: 20, marginTop: -25}}>
        <Title style={{fontSize: 26, width: '100%'}}>Create Downlink Payload</Title>
        <Row>
          <Col sm={24}>
            <Text style={inputHeadingStyle}>Payload</Text>
          </Col>
        </Row>
        <Row>
          <Col sm={14}>
            <Input/>
          </Col>
          <Col sm={10}>
            <Group value={payloadType} onChange={(el) => setPayloadType(el.target.value)} style={{marginLeft: 20}}>
              <Button value="bytes" style={{height: 36}}>Bytes</Button>
              <Button value="fields" style={{height: 36}}>Fields</Button>
            </Group>
          </Col>
        </Row>
        
        <Row>
          <Col sm={16}>
            <Text style={inputHeadingStyle}>Fport</Text>
          </Col>
          <Col sm={16}>
            <InputNumber defaultValue={0} onChange={setPort}/>
          </Col>
        </Row>
      </Card>
      <div style={{position: 'absolute', bottom: -16, right: 40, backgroundColor: '#40A9FF', borderRadius: 9999, width: 36, height: 36}}>
          <div style={{position: 'relative', width: '100%', height: '100%'}}>
            <img src={DownlinkImage} style={{height: 15, width: 22, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50% , -50%)'}}/>
          </div>
        </div>
    </div>
    
  )
}

export default Downlink