import React from 'react';
import FilledFunctionIcon from '../../../../img/filled-function-node-icon.svg';
import FilledChannelNodeIcon from '../../../../img/filled-channel-node-icon.svg';
import GroupNodeIcon from '../../../../img/filled-group-node-icon.svg';
import FunctionContent from './FunctionContent';
import ChannelContent from './ChannelContent';
import DeviceContent from './DeviceContent';
import GroupContent from './GroupContent';

export default ({ id, type }) => {
  const renderTopIcon = () => {
    switch (type) {
      case 'function':
        return <img src={FilledFunctionIcon} style={{ height: 50 }} />;
      case 'device':
        return null;
      case 'label':
        return <img src={GroupNodeIcon} style={{ height: 50 }} />;
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
        return <GroupContent id={id} type={type} />;
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