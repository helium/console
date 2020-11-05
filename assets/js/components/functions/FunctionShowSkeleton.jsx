import React, { Component } from 'react';
import { Skeleton } from 'antd';
import DashboardLayout from '../common/DashboardLayout';
import { Card, Row, Col } from 'antd';

class FunctionShowSkeleton extends Component {
  render() {
    return (
      <DashboardLayout>
        <Skeleton title={true} paragraph={{ rows: 0 }} active />
        <Card>
          <Skeleton title={false} paragraph={{ rows: 3 }} active />
        </Card>
        <Card>
          <Skeleton title={false} paragraph={{ rows: 3 }} active />
        </Card>
      </DashboardLayout>
    )
  }
};

export default FunctionShowSkeleton;