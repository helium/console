import React from 'react';
import { Skeleton } from 'antd';
import DashboardLayout from '../common/DashboardLayout';
import { Card } from 'antd';

export const ChannelShowSkeleton = () => {
    return (
      <DashboardLayout>
        <Skeleton title={true} paragraph={{ rows: 0 }} active />
        <Card>
          <Skeleton title={false} paragraph={{ rows: 9 }} active />
        </Card>
        <Card>
          <Skeleton title={false} paragraph={{ rows: 4 }} active />
        </Card>
        <Card>
          <Skeleton title={false} paragraph={{ rows: 2 }} active />
        </Card>
        <Card>
          <Skeleton title={false} paragraph={{ rows: 5 }} active />
        </Card>
      </DashboardLayout>
    );
};