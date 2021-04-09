import React from 'react';
import SelectedIcon from '../../../../img/selected-node.svg';

export default () => {
  return (
    <div style={{
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center' 
    }}>
      <img src={SelectedIcon} id="selected-node-icon" />
    </div>
  );
}