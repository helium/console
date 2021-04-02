import React from 'react';
import FilledFunctionIcon from '../../../../img/filled-function-node-icon.svg';
import FilledChannelNodeIcon from '../../../../img/filled-channel-node-icon.svg';
import FunctionContent from './FunctionContent';
import ChannelContent from './ChannelContent';

export default ({ id, type }) => {
  const renderTopIcon = () => {
    switch (type) {
      case 'function':
        return <img src={FilledFunctionIcon} style={{ height: 50 }} />;
      case 'device':
        return null;
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
        return null;
      case 'utility':
        return null;
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