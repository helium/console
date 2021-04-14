import React from 'react';
import { Skeleton } from 'antd';
import DashboardLayout from '../common/DashboardLayout';
import { Card } from 'antd';

export const FunctionShowSkeleton = ({user}) => {
    return (
      <DashboardLayout user={user}>
        <Skeleton title={true} paragraph={{ rows: 0 }} active />
        <Card>
          <Skeleton title={false} paragraph={{ rows: 6 }} active />
        </Card>
      </DashboardLayout>
    );
};
