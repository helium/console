import React from 'react';
import Icon from '@ant-design/icons';

const StatusSvg = () => (
  <svg height="10" width="10">
    <circle cx="5" cy="5" r="5" fill="green" />
  </svg> 
);

export const StatusIcon = props => <Icon component={StatusSvg} {...props} />;