import React from 'react';
import { Popover, Menu, Switch } from "antd";
import Text from 'antd/lib/typography/Text';
const { SubMenu } = Menu;
import { updateDevice } from '../../../actions/device'
import { useDispatch } from 'react-redux';
import AdrSimpleIcon from '../../../../img/adr/adr-simple-icon.svg';
import AlertSimpleIcon from '../../../../img/alerts/AlertSimpleIcon';
import MultiBuySimpleIcon from '../../../../img/multi_buy/MultiBuySimpleIcon';
import Icon from '@ant-design/icons';

export default ({ children, adr, adrAllowed, id, packets }) => {
  const dispatch = useDispatch();

  const renderContent = () => (
    <div style={{ width: 170 }}>
      { adr && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            <img style={{ height: 8, marginRight: 10 }} src={AdrSimpleIcon} />
            <Text strong>{`${adrAllowed ? 'Disable' : 'Enable'} ADR`}</Text>
          </span>
          
          <Switch 
            onChange={adrValue => {
              const deviceId = id;
              const attrs = { adr_allowed: adrValue }
              dispatch(updateDevice(deviceId, attrs));
            }}
            checked={adrAllowed}
          />
        </div>
      )}
      <Menu id='node-quick-settings' mode="vertical" inlineIndent={0}>
        <SubMenu icon={<Icon style={{ height: 10 }} component={AlertSimpleIcon} />} key="sub1" title="Configure Alerts">
          <Menu.Item key="1"><Switch /></Menu.Item>
          <Menu.Item key="2">gerg</Menu.Item>
        </SubMenu>
        { packets && (
          <SubMenu icon={<Icon component={MultiBuySimpleIcon} />} style={{ padding: 0 }} key="sub2" title="Configure Packets">
            <Menu.Item key="3"><Switch /></Menu.Item>
            <Menu.Item key="4">Option 2</Menu.Item>
          </SubMenu>
        )}
      </Menu>
    </div>
  );

  return (
    <Popover
      content={renderContent()}
      placement="bottom"
    >
      {children}
    </Popover>
  );
}