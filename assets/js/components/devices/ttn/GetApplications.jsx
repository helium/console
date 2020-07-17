import React, { Fragment, useState } from 'react';
import { Button, Typography, Input } from 'antd';
import TTNImport from '../../../../img/ttn-import.png';
const { Text, Title } = Typography

const TTN_URL = 'https://account.thethingsnetwork.org';

const GetApplications = (props) => {

  const { fetchTtnDevices } = props;
  const [ ttnCode, setTtnCode ] = useState('');
  
  return (
    <Fragment>
      <img src={TTNImport} style={{marginTop: 40, marginBottom: 40, height: 100, objectFit: 'cover'}}/>
      <Title style={{width: '100%', textAlign: 'center', fontSize: 30}}>
        Import Devices
      </Title>
      <Text style={{width: '100%', textAlign: 'center'}}>
        Generate a single-use ttnctl code at:
      </Text>
      <a href={TTN_URL} target="_blank" style={{marginBottom: 40, textDecoration: 'underline'}}>
        {TTN_URL.replace('https://', '')}
      </a>
      <Input
        value={ttnCode}
        onChange={ (e) => setTtnCode(e.target.value) }
        placeholder='Enter ttnctl code here...'
        style={{ marginBottom: 10, marginLeft: 40, marginRight: 40 }}
      />
      <Button
        key="submit"
        type="primary"
        style={{ width: '100%', marginLeft: 40, marginRight: 40 }}
        onClick={() => {fetchTtnDevices(ttnCode)}}
        disabled={!ttnCode}
      >
        Start Importing Devices
      </Button>
    </Fragment>
  )
}

export default GetApplications;