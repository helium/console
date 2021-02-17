import React, { useState } from 'react';
import { Card, Typography, Input, InputNumber, Row, Col, Radio, Checkbox, Tooltip, Button as RegularButton } from 'antd';
import DownlinkImage from '../../../img/downlink.svg';
import { ClearOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Group, Button } = Radio;

const Downlink = ({onSend}) => {
  const [port, setPort] = useState(1);
  const [confirm, setConfirm] = useState(true);
  const [payloadType, setPayloadType] = useState('bytes');
  const [payload, setPayload] = useState('');
  const [position, setPosition] = useState("last");

  return (
    <React.Fragment>
      <div style={{position: 'relative'}}>
        <Card style={{marginRight: 20, marginLeft: 20, marginTop: -25}}>
          <Title style={{fontSize: 22}}>Add Downlink Payload</Title>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Text style={{ display: "block", marginBottom: 4 }}>Scheduling</Text>
              <Group value={position} buttonStyle="solid" onChange={el => setPosition(el.target.value)}>
                <Button value="first">First</Button>
                <Button value="last">Last</Button>
              </Group>
            </Col>
            <Col span={12}>
              <Text style={{ display: "block", marginBottom: 4 }}>FPort</Text>
              <InputNumber style={{ width: '100%' }}defaultValue={1} min={1} max={222} onChange={setPort}/>
            </Col>
          </Row>

          <div style={{ marginTop: 15 }}>
            <Text style={{ display: "block", marginBottom: 4 }}>Payload</Text>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <Input placeholder="Enter Payload" onChange={(e) => setPayload(e.target.value)} style={{ marginRight: 16 }}/>

              <Tooltip title='Select encoded to send a Base64 encoded payload, or plain to have the payload Base64 encoded for you.' placement='topRight'>
                <Group value={payloadType} onChange={(el) => setPayloadType(el.target.value)} buttonStyle="solid" style={{ display: 'flex', flexDirection: 'row' }}>
                  <Button value="bytes">Bytes</Button>
                  <Button value="fields">Fields</Button>
                </Group>
              </Tooltip>
            </div>
          </div>

          <div style={{ marginTop: 15 }}>
            <Checkbox
              checked={confirm}
              onChange={(e) => setConfirm(e.target.checked)}
              style={{ marginRight: 8}}
            />
            <Text>I'd like confirmation of response</Text>
          </div>
        </Card>
        <div style={{position: 'absolute', bottom: -16, right: 40, backgroundColor: '#40A9FF', borderRadius: 9999, width: 40, height: 40}}>
          <div style={{position: 'relative', width: '100%', height: '100%', cursor: 'pointer'}}
            onClick={() => {
              const message = payloadType === 'fields' ? Buffer.from(payload).toString('base64') : payload;
              onSend(message, confirm, port, position);
            }}
          >
            <img
              src={DownlinkImage}
              style={{height: 18, width: 24, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50% , -50%)'}}
            />
          </div>
        </div>
      </div>
      <div style={{marginRight: 20, marginLeft: 20, marginTop: 15}}>
      <RegularButton
          size="large"
          type="primary"
          icon={<ClearOutlined />}
          onClick={() => {console.log("HELLO!")}}
          style={{ borderRadius: 4 }}
        >
          Clear Queue for Device
        </RegularButton>
      </div>
    </React.Fragment>
  )
}

export default Downlink
