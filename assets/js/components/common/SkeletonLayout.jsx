import React, { Component } from 'react';
import { Skeleton } from 'antd';

class SkeletonLayout extends Component {
  render() {
    return (
      <div>
        <Skeleton title={false} paragraph={{ rows: 5 }} active />
      </div>
    )
  }
};

export default SkeletonLayout;