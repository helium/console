import React from 'react';
import SelectedIcon from '../../../../img/selected-node.svg';

export default () => {
  return (
    <div style={{
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center' 
    }}>
      <img src={SelectedIcon} style={{ 
        position: 'absolute',
        top: '-40px',
        height: 35,
        opacity: 0,
        animationName: 'bounceIn',
        animationDuration: '400ms',
        animationTimingFunction: 'linear',
        animationFillMode: 'forwards'
      }} />
    </div>
  );
}