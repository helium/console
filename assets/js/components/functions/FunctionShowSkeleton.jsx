import React from 'react';
import { Skeleton } from 'antd';
import DashboardLayout from '../common/DashboardLayout';
import { Card } from 'antd';

export const FunctionShowSkeleton = () => {
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
    );
};