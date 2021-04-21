import React, { useState } from 'react';
import { Button, Row, Col, Input } from 'antd';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import AddDeviceAlertIcon from '../../../img/alerts/device-group-alert-add-icon.svg';
import AddFunctionAlertIcon from '../../../img/alerts/function-alert-add-icon.svg';
import AddIntegrationAlertIcon from '../../../img/alerts/channel-alert-add-icon.svg';
import Text from 'antd/lib/typography/Text';
import { useDispatch } from "react-redux";
import { createAlert } from '../../actions/alert'

export default (props) => {
  const [name, setName] = useState('');
  const dispatch = useDispatch();

  const renderIcon = () => {
    switch (props.alertType) {
      case 'device/group':
        return (AddDeviceAlertIcon);
      case 'function':
        return (AddFunctionAlertIcon);
      case 'integration':
        return (AddIntegrationAlertIcon);
      default:
        return null;
    }
  }

  const renderTitle = () => {
    switch (props.alertType) {
      case 'device/group':
        return 'New Device/Group Alert';
      case 'function':
        return 'New Function Alert';
      case 'integration':
        return 'New Integration Alert';
      default:
        return null;
    }
  }

  const renderForm = () => {
    switch (props.alertType) {
      case 'device/group':
        return (<div>[placeholder]</div>);
      case 'function':
        return (<div>[placeholder]</div>);
      case 'integration':
        return (<div>[placeholder]</div>);
      default:
        return null;
    }
  }

  const renderButton = () => {
    switch (props.alertType) {
      case 'device/group':
        return (
          <Button
            icon={<PlusOutlined />}
            type="primary"
            style={{ backgroundColor: '#2C79EE', borderRadius: 50, text: 'white' }}
            onClick={() => { dispatch(createAlert({
              name: name,
              config: {
                email: {
                  device_deleted: 'hello'
                }
              },
              node_type: 'device/group'
            })) }}
          >
            Create Device/Group Alert
          </Button>
        );
      case 'function':
        return (
          <Button
            icon={<PlusOutlined />}
            type="primary"
            style={{ backgroundColor: '#9F59F7', borderRadius: 50, text: 'white' }}
            onClick={() => { console.log("[placeholder]") }}
          >
            Create Function Alert
          </Button>
        );
      case 'integration':
        return (
          <Button
            icon={<PlusOutlined />}
            type="primary"
            style={{ backgroundColor: '#12CB9E', borderRadius: 50, text: 'white' }}
            onClick={() => { console.log("[placeholder]") }}
          >
            Create Integration Alert
          </Button>
        );
      default:
        return null;
    }
  }

  return (
    <div style={{ padding: '30px 30px 20px 30px' }}>
      <Button icon={<ArrowLeftOutlined />} style={{ border: 'none' }} onClick={props.back}>Back</Button>
      <Row style={{ marginTop: '10px' }}>
        <Col span={10} style={{ padding: '70px 80px' }}>
          <img src={renderIcon()} />
          <h1 style={{ marginTop: 10, fontSize: '23px', fontWeight: 600 }}>{renderTitle()}</h1>
          <div>
            <p style={{ fontSize: '16px' }}>Alerts can be created for Device/Group Nodes, Function Nodes or Integration Nodes.</p>
            <p><a>Learn more about alerts</a></p>
          </div>
        </Col>
        <Col span={12} style={{ padding: '40px 20px'}}>
          <Text style={{ fontSize: '16px' }} strong>Alert Name</Text>
          <Input
            onChange={e => { setName(e.target.value) }}
            value={name}
            placeholder='e.g. Master Alert'
            suffix={`${name.length}/25`} 
            maxLength={25}
          />
          <div style={{ marginTop: 20 }}>
            {renderForm()}
          </div>
          <div style={{ marginTop: 20 }}>
            {renderButton()}
          </div>
        </Col>
      </Row>
    </div>
  );
}