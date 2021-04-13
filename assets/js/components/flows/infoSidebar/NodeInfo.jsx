import React from 'react';
import FilledFunctionIcon from '../../../../img/filled-function-node-icon.svg';
import FilledChannelNodeIcon from '../../../../img/filled-channel-node-icon.svg';
import FilledGroupNodeIcon from '../../../../img/filled-group-node-icon.svg';
import FilledDeviceNodeIcon from '../../../../img/filled-device-node-icon.svg';
import FunctionContent from './FunctionContent';
import ChannelContent from './ChannelContent';
import DeviceContent from './DeviceContent';
import LabelContent from './LabelContent';

export default ({ id, type }) => {
  const renderTopIcon = () => {
    switch (type) {
      case 'function':
        return <img src={FilledFunctionIcon} style={{ height: 50 }} />;
      case 'device':
        return <img src={FilledDeviceNodeIcon} style={{ height: 50 }} />;
      case 'label':
        return <img src={FilledGroupNodeIcon} style={{ height: 50 }} />;
      case 'utility':
        return null;
      case 'channel':
        return <img src={FilledChannelNodeIcon} style={{ height: 50}} />;
    }
  }

  const renderMain = (fxn) => {
    switch (type) {
      case 'function':
        return (<FunctionContent id={id} type={type} />);
      case 'device':
        return (<DeviceContent id={id} type={type} />);
      case 'utility':
        return null;
      case 'label':
        return <LabelContent id={id} type={type} />;
      case 'channel':
        return (<ChannelContent id={id} type={type} />);
    }
  }

  return (
    <React.Fragment>
      <div style={{ position: 'absolute', top: '30px', right: '35px' }}>
        {renderTopIcon()}
      </div>
      <div style={{ padding: 40, marginTop: 20 }}>
        {renderMain()}
      </div>
    </React.Fragment>
  );
}