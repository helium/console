import React, { useState, useEffect } from 'react';
import { Switch, Typography, Dropdown, Menu } from 'antd';
import { update } from 'lodash';
const { Text } = Typography;
import { determineTimeValueToShow } from './constants';

export default (props) => {
  const [recipient, setRecipient] = useState('admin');
  const [value, setValue] = useState(60);
  const [checked, setChecked] = useState(false);
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    props.onChange({
      key: props.eventKey,
      ...(props.hasValue && { value }),
      ...(props.type === 'email' && { recipient }),
      ...(props.type === 'webhook' && { url }),
      ...(props.type === 'webhook' && { notes }),
      checked: checked
    })
  }, [recipient, value, checked, url, notes]);

  const recipientMenu = () => (
    <Menu onClick={e => { setRecipient(e.key) }}>
      <Menu.Item key="admin">Admin</Menu.Item>
      <Menu.Item key="manager">Manager</Menu.Item>
      <Menu.Item key="read">Read-Only</Menu.Item>
      <Menu.Item key="all">All</Menu.Item>
    </Menu>
  );

  const timeMenu = (key) => (
    <Menu onClick={e => { setValue(e.key) }}>
      <Menu.Item key="15">15 mins</Menu.Item>
      <Menu.Item key="30">30 mins</Menu.Item>
      <Menu.Item key="60">1 hr</Menu.Item>
      <Menu.Item key="360">6 hrs</Menu.Item>
      <Menu.Item key="540">9 hrs</Menu.Item>
      <Menu.Item key="1440">24 hrs</Menu.Item>
    </Menu>
  );

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
      <span>
        <Text style={{ fontSize: '16px' }}>Alert </Text>
        {props.type === 'email' && <Dropdown overlay={recipientMenu()}>
          <a 
            className="ant-dropdown-link" 
            onClick={e => e.preventDefault()} 
            style={{ textTransform: 'capitalize', textDecoration: 'underline', fontSize: '16px' }}
          >
            {recipient}
          </a>
        </Dropdown>}
        {props.type === 'email' ? <Text style={{ fontSize: '16px' }}> when </Text> : <Text style={{ fontSize: '16px' }}>when </Text>}
        <Text style={{ fontSize: '16px' }} strong>{props.eventDescription}</Text>
        {props.hasValue && 
          <Dropdown overlay={timeMenu()}>
            <a 
              className="ant-dropdown-link" 
              onClick={e => e.preventDefault()} 
              style={{ textTransform: 'capitalize', textDecoration: 'underline', fontSize: '16px' }}
            >
              {
                determineTimeValueToShow(value)
              }
            </a>
          </Dropdown>
        }
      </span>
      <Switch
        style={{ marginLeft: 10 }}
        checked={checked}
        onChange={checked => { setChecked(checked) }}
      />
    </div>
  );
}