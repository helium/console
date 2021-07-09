import React from 'react';
import Icon from '@ant-design/icons/lib/components/Icon';
import { Tooltip } from 'antd';

const StatusSvg = () => (
  <svg height="11" width="10">
    <circle cx="5" cy="5" r="5" fill="green" />
  </svg>
);

export const StatusIcon = props => (
  <Tooltip title={props.tooltipTitle} placement='right'>
    <Icon component={StatusSvg} style={{ marginLeft: 4, marginTop: -2 }} />
  </Tooltip>
);
