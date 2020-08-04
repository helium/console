import React, { Fragment, useState } from 'react';
import { Typography, Button, Row, Col, Checkbox } from 'antd';
const { Title, Text } = Typography;

const ShowDeviceData = ({ numDevices, onImport }) => {
  const [createLabels, setCreateLabels] = useState(true);
  return (
    <Fragment>
      <Title style={{width: '100%', textAlign: 'center'}}>{`${numDevices} Devices Found`}</Title>
      <Row style={{ marginTop: 10, width: '100%' }}>
        <Col sm={4}/>
        <Col sm={1}><Checkbox checked={createLabels} onChange={() => setCreateLabels(!createLabels)}/></Col>
        <Col sm={17}>
          <Text style={{paddingLeft: 20, fontSize: 14, lineHeight: .9}}>
            Import these devices with a premade label
          </Text>
        </Col>
      </Row>
      <Button type="primary" style={{marginTop: 40}} onClick={() => onImport(createLabels)}>Import Devices</Button>
    </Fragment>
  )
}

export default ShowDeviceData;