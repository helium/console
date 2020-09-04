import React, { useState } from 'react';
import { Card, Typography, Input, InputNumber, Row, Col, Radio, Checkbox, Tooltip } from 'antd';
import DownlinkImage from '../../../img/downlink.svg';

const { Title, Text } = Typography;
const { Group, Button } = Radio;

const inputHeadingStyle = {
  fontSize: 14,
  fontWeight: 600
}

const Downlink = ({onSend}) => {
  const [port, setPort] = useState(1);
  const [confirm, setConfirm] = useState(false);
  const [payloadType, setPayloadType] = useState('bytes');
  const [payload, setPayload] = useState('');
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
            <Input onChange={(e) => setPayload(e.target.value)}/>
          </Col>
          <Col sm={10}>
            <Tooltip title='Select encoded to send a Base64 encoded payload, or plain to have the payload Base64 encoded for you.' placement='topRight'>
              <Group value={payloadType} onChange={(el) => setPayloadType(el.target.value)} style={{marginLeft: 20}}>
                <Button value="bytes" style={{height: 36}}>Encoded</Button>
                <Button value="fields" style={{height: 36}}>Plain</Button>
              </Group>
            </Tooltip>
          </Col>
        </Row>
        <Row>
          <Col sm={24}>
            <Text style={inputHeadingStyle}>Fport</Text>
          </Col>
          <Col sm={8}>
            <InputNumber defaultValue={1} min={1} max={222} onChange={setPort}/>
          </Col>
          <Col sm={15} style={{textAlign: 'right'}}>
            <Text style={{fontSize: 14, marginRight: 5, marginTop: 12}}>Require message confirmation</Text>
            <Checkbox
              style={{marginTop: 12}}
              checked={confirm}
              onChange={(e) => setConfirm(e.target.checked)}
            />
          </Col>
        </Row>
      </Card>
      <div style={{position: 'absolute', bottom: -16, right: 40, backgroundColor: '#40A9FF', borderRadius: 9999, width: 36, height: 36}}>
          <div style={{position: 'relative', width: '100%', height: '100%', cursor: 'pointer'}}
            onClick={() => {
              const message = payloadType === 'fields' ? Buffer.from(payload).toString('base64') : payload;
              onSend(message, confirm, port);
            }}
          >
            <img
              src={DownlinkImage}
              style={{height: 15, width: 22, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50% , -50%)'}}
            />
          </div>
        </div>
    </div>
    
  )
}

export default Downlink