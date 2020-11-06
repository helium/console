import React from 'react';
import { Skeleton } from 'antd';

export const SkeletonLayout = () => {
  return (<Skeleton title={false} paragraph={{ rows: 5 }} active />);
}